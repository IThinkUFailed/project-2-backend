import 'dotenv/config'
const tasteDiveApiKey = process.env.TASTEDIVE_API_KEY
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET



export async function getSpotifyToken(req, res) {
    console.log(tasteDiveApiKey, '<-- tasteDiveApiKey in getSpotifyToken')
    console.log(clientId, '<-- clientId in getSpotifyToken')
    console.log(clientSecret, '<-- clientSecret in getSpotifyToken')
    console.log('getSpotifyToken called')
    let url = 'https://accounts.spotify.com/api/token'
    let token = null;
    return fetch(url, {
        method: 'POST', 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded" 
            
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    }).then((response)=>{
            console.log(response, '<-- response')
        return response.json()
    }).then((data)=>{

        token = data.access_token
        console.log(token, '<-- token')
        return token
    })
     
}

export async function searchArtist(req, res) {
    console.log('searchArtist called')  
    const name = req.query.name
    console.log(name)


    if (name.length === 0) {
        searchBtn.classList.add("disabled")
        console.log("no name provided")
        return
    } else {


    const token = await getSpotifyToken();
    const urlArtist = `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`
    const responseArtist = await fetch(urlArtist, {
        headers: { "Authorization": `Bearer ${token}` }
       } 
    );
    console.log(responseArtist, '<-- responseArtist')
    
   const similarArtists = await findSimilarArtists(name);
    // console.log(similarArtists)
    const data = await responseArtist.json();
    console.log
    const artist = data.artists["items"]
    const artistUrl = data.artists["items"][0].external_urls.spotify
    let artistId = data.artists["items"][0].id
    // console.log(artistId)
    const {trackArray, trackUrlArray} = await searchArtistTracks(artistId, token);
    const albumArray = await searchArtistAlbums(artistId, token);
    const result = {
        name: artist[0].name,
        id: artist[0].id,
        img: artist[0].images,
        followers: artist[0].followers,
        popularity: artist[0].popularity,
        albums: albumArray,
        spotify: artist[0].external_urls.spotify,
        topTracks: trackArray,
        trackUrls: trackUrlArray,
        similarArtists: similarArtists,
        listenUrl: artistUrl
    } 
    return result
   }
}

export async function searchArtistTracks(artistId, token) {
    console.log(artistId, '<-- artistId in searchArtistTracks')
    console.log(token, '<-- token in searchArtistTracks')
    const trackArray = []
    const maxResults = 10
    const trackUrlArray = []
    const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;

    const topTrackResponse = await fetch(topTracksUrl, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    let topTracksData = await topTrackResponse.json()
    console.log(topTracksData["tracks"])
    topTracksData = topTracksData["tracks"];

        for (let i = 0; i < topTracksData.length && i < maxResults; i++) {
        //console.log(topTracksData[i].name)
        trackArray.push(topTracksData[i].name)
        console.log(topTracksData[i].external_urls.spotify)
        trackUrlArray.push(topTracksData[i].external_urls.spotify)
        //console.log(trackArray)
    }
    // console.log("Success! <-- searchArtistTracks")
    return { trackArray, trackUrlArray};
}

export async function searchArtistAlbums(artistId, token) {
    console.log(artistId, '<-- artistId in searchArtistAlbums')
    console.log(token, '<-- token in searchArtistAlbums')
    
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums`
    const responseAlbums = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    // console.log(responseAlbums, 'Response Albums')
    let albums = await responseAlbums.json()
    if (albums.length !== 0) {
        albums = albums["items"]
    }
    const maxResults = 10;
    const albumArray = []
        for (let i = 0; i < albums.length; i++) {
        // console.log(albums[i].name)
        albumArray.push(albums[i].name)
    }
 return albumArray


}

async function findSimilarArtists(artistName) {
console.log(artistName, '<-- artistName in findSimilarArtists')
const url = `https://tastedive.com/api/similar?q=${artistName}&type=music&k=1068377-yespleas-B02E7CBE`;
const maxResults = 6;
const artistsArray = []
const response = await fetch(url);
console.log(response, '<-- response in findSimilarArtists')
// console.log(proxyUrl)
const similarArtists = await response.json()

// console.log(similarArtists["similar"]["results"])
for (let i = 0; i < maxResults; i++) {
    // console.log(similarArtists["similar"]["results"][i])
    artistsArray.push(similarArtists["similar"]["results"][i])
    // console.log(artistsArray)
}

return similarArtists

}
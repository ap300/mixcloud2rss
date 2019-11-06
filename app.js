const Podcast = require('podcast');
const fetch = require('node-fetch');

const uri = "https://api.mixcloud.com";
const mixcloud_user = "djmrnickHPR";
const mixcloud_dl_uri = "http://download.mixcloud-downloader.com/d/mixcloud";
const mixcloud_page_uri = "http://www.mixcloud-downloader.com/dl/mixcloud";

async function main () {
    let mc_user = fetch(`${uri}/${mixcloud_user}`).then(response => response.json());
    let mc_feed = fetch(`${uri}/${mixcloud_user}/cloudcasts`).then(response => response.json());
    
    let user = await mc_user;
    const feed = new Podcast({
        title: user.name,
        description: user.blog,
        site_url: user.url,
        image_url: user.pictures.extra_large,
        //feed_url: 'http://example.com/rss.xml',
        //itunesOwner: {
        //    name: "DJ Mr Nick HPR",
        //    email: "djmrnick@hawaiipublicradio.org"
        //}
    });

    const promises = [];
    const pods = await mc_feed;
    const items = [];
    for (cast of pods.data) {
        let item = {
            title: cast.name,
            url: cast.url,
            date: cast.created_time,
            enclosure: {
                url: mixcloud_dl_uri + cast.key + "#stream.m4a"
            },
        };
        promises.push(updateDescription(item, cast.key));
        promises.push(updateUri(item, cast.key));
        items.push(item);
    }

    await Promise.all(promises);
    items.forEach(item => feed.addItem(item));

    process.stdout.write(feed.buildXml('  '));
    console.error(pods.data[0].created_time);
    console.error(pods.data[0].name);

}

main();

function updateDescription (item, key) {
    return fetch(`${uri}/${key}`)
        .then(response => response.json())
        .then(data => {
            item.description = data.description;
        });
}

const re_uri = /"(.*mixcloud\.com.*)"/;
function updateUri (item, key) {
    return fetch(`${mixcloud_page_uri}/${key}`)
        .then(response => response.text())
        .then(body => {
            let result = re_uri.exec(body);
            if (result != null) {
                item.enclosure.url = result[1];
                item.enclosure.type = "audio/mp4";
            }
        });
}

/* lets create an rss feed */
const feed = new Podcast({
    title: 'title',
    description: 'description',
    feed_url: 'http://example.com/rss.xml',
    site_url: 'http://example.com',
    image_url: 'http://example.com/icon.png',
    docs: 'http://example.com/rss/docs.html',
    author: 'Dylan Greene',
    managingEditor: 'Dylan Greene',
    webMaster: 'Dylan Greene',
    copyright: '2013 Dylan Greene',
    language: 'en',
    categories: ['Category 1','Category 2','Category 3'],
    pubDate: 'May 20, 2012 04:00:00 GMT',
    ttl: '60',
    itunesAuthor: 'Max Nowack',
    itunesSubtitle: 'I am a sub title',
    itunesSummary: 'I am a summary',
    itunesOwner: { name: 'Max Nowack', email:'max@unsou.de' },
    itunesExplicit: false,
    itunesCategory: {
        "text": "Entertainment",
        "subcats": [{
          "text": "Television"
        }]
    },
    itunesImage: 'http://link.to/image.png'
});
 
/* loop over data and add to feed */
feed.addItem({
    title:  'item title',
    description: 'use this for the content. It can include html.',
    url: 'http://example.com/article4?this&that', // link to the item
    guid: '1123', // optional - defaults to url
    categories: ['Category 1','Category 2','Category 3','Category 4'], // optional - array of item categories
    author: 'Guest Author', // optional - defaults to feed author property
    date: 'May 27, 2012', // any format that js Date can parse.
    lat: 33.417974, //optional latitude field for GeoRSS
    long: -111.933231, //optional longitude field for GeoRSS
    enclosure : {url:'...'},//, file:'path-to-file'}, // optional enclosure
    itunesAuthor: 'Max Nowack',
    itunesExplicit: false,
    itunesSubtitle: 'I am a sub title',
    itunesSummary: 'I am a summary',
    itunesDuration: 12345,
    itunesKeywords: ['javascript','podcast']
});
 
// cache the xml to send to clients
const xml = feed.buildXml();
//process.stdout.write(xml)

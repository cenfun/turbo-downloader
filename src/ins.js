import { showMessage } from './message.js';
import { request } from './socket.js';

const getArticleTarget = (target) => {

    while (target.parentNode) {

        target = target.parentNode;
        if (target.nodeName === 'ARTICLE') {
            return target;
        }

    }

};

const getVideoInfo = async (options, video) => {

    const { code } = options;

    const videoInfo = await request('get-ins-data', options);
    if (!videoInfo) {
        showMessage(`Not found video info: ${code}`);
        return;
    }

    console.log(videoInfo.video_versions, videoInfo.carousel_media);

};

const getItemInfo = (options, container) => {

    const video = container.querySelector('video');
    if (video) {
        return getVideoInfo(options, video);
    }


    const img = container.querySelector('img');
    if (!img) {
        showMessage('Not found img');
        console.log(container);
        return;
    }

    let url = img.src;


    const srcset = img.srcset;
    if (srcset) {
        const first = srcset.split(',')[0].split(' ')[0];
        if (first) {
            url = first;
        }
    }

    console.log('url', url);

    // https://scontent.cdninstagram.com/v/t51.2885-15/393410660_250130180990453_6375559256093049118_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi42NDB4ODAwLnNkciJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=105&_nc_ohc=i7DTT_pOHnUAX-T3PmJ&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzIxNzY4NDk4NTQyNzcwMzAxMg%3D%3D.2-ccb7-5&oh=00_AfBW03mDRQ5UdGW9q63S2keGoYTD905nDM_kSoMEALVl3A&oe=653910CA&_nc_sid=10d13b

    const id = url.split('?')[0].split('/').pop();

    const filename = `${options.user}-${id}`;

    return {
        url,
        filename
    };
};


const getListInfo = (options, list) => {

    const container = list[0].parentNode.parentNode.parentNode;

    // console.log('list length', list.length);
    const containerX = container.getBoundingClientRect().x;
    // console.log('containerX', containerX);

    const item = list.find((li) => {
        const itemX = li.getBoundingClientRect().x;
        // console.log('itemX', itemX);
        return itemX === containerX;
    });

    // console.log(item);

    if (item) {
        return getItemInfo(options, item);
    }

    showMessage('Not found presentation list item');
};

const getOptions = (container) => {
    const aList = Array.from(container.querySelectorAll('a'));
    if (!aList.length) {
        showMessage('Not found a list for options');
        return;
    }

    let userLink;
    let pageLink;
    aList.forEach((a) => {

        const href = a.href;
        // console.log('href', href);

        if (!href) {
            return;
        }

        if (href.startsWith('https://www.instagram.com/p/')) {
            if (!pageLink) {
                pageLink = href;
            }
            return;
        }

        if (!userLink) {
            userLink = href;
        }

    });

    if (!userLink || !pageLink) {
        showMessage('Not found user or page link');
        return;
    }

    const user = new URL(userLink).pathname.split('/')[1];
    console.log('user', user);

    const code = new URL(pageLink).pathname.split('/')[2];
    console.log('code', code);

    const options = {
        user,
        code
    };

    return options;
};

// item in home page list
const getHomeInfo = (downloadArticle) => {
    const head = downloadArticle.lastChild.childNodes[0];

    const options = getOptions(head);
    if (!options) {
        return;
    }

    const body = downloadArticle.firstChild.childNodes[1];

    const button = body.querySelector("[role='button']");
    if (!button) {
        showMessage('Not found button');
        return;
    }

    const list = Array.from(button.querySelectorAll('ul li'));
    if (list.length) {
        return getListInfo(options, list);
    }

    return getItemInfo(options, button);
};


// item in popup
const getPopupInfo = (downloadArticle) => {

    const right = downloadArticle.firstChild.childNodes[1];

    const options = getOptions(right);
    if (!options) {
        return;
    }

    const left = downloadArticle.firstChild.childNodes[0];

    const list = Array.from(left.querySelectorAll('ul li'));
    if (list.length) {
        return getListInfo(options, list);
    }

    const video = left.querySelector('video');
    if (video) {
        return getVideoInfo(options, video);
    }

    const button = left.querySelector("[role='button']");
    if (button) {
        return getItemInfo(options, button);
    }


    showMessage('Not found button and presentation');

};


const onLoad = async () => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));

    const contents = scripts.map((it) => it.textContent);

    const feedContent = contents.find((it) => it.indexOf('xdt_api__v1__feed__timeline__connection') !== -1);

    if (!feedContent) {
        console.log('ERROR: not found feed info');
        return;
    }

    const startStr = '"edges":';
    const startIndex = feedContent.indexOf(startStr);
    const endIndex = feedContent.indexOf(',"page_info"');

    const edges = feedContent.slice(startIndex + startStr.length, endIndex);
    //  console.log(edges);

    const list = JSON.parse(edges).map((it) => it.node.media).filter((it) => it);

    // console.log('feed list', list);

    await request('set-ins-list', list);
    // console.log(res);
};


let downloadArticle;
let downloadTarget;

export default {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/',

    bindEvents: (showHelper, hideHelper) => {

        onLoad();

        document.addEventListener('mouseover', (e) => {
            const target = e.target;

            // empty div with image size
            if (target.offsetWidth < 300 || target.offsetHeight < 200 || target.innerHTML) {
                return;
            }

            // find article container
            const articleTarget = getArticleTarget(target);
            if (!articleTarget) {
                return;
            }

            if (downloadArticle === articleTarget) {
                return;
            }

            downloadArticle = articleTarget;
            downloadTarget = target;

            showHelper(downloadTarget);

            const mouseleaveHandler = () => {
                if (downloadTarget) {
                    downloadTarget.removeEventListener('mouseleave', mouseleaveHandler);
                }
                downloadTarget = null;
                downloadArticle = null;
                hideHelper();
            };

            downloadTarget.addEventListener('mouseleave', mouseleaveHandler);


        });

    },

    getDownloadInfo: () => {
        // console.log(downloadArticle);

        // popup
        if (downloadArticle.role === 'presentation') {
            return getPopupInfo(downloadArticle);
        }

        return getHomeInfo(downloadArticle);

    }
};

import { showMessage } from './message.js';

const getArticleTarget = (target) => {

    while (target.parentNode) {

        target = target.parentNode;
        if (target.nodeName === 'ARTICLE') {
            return target;
        }

    }

};

const getItemInfo = (user, container) => {
    const img = container.querySelector('img');
    if (!img) {
        showMessage('Not found img');
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

    const filename = `${user}-${id}`;

    return {
        url,
        filename
    };
};


const getListInfo = (user, presentation) => {

    const list = presentation.querySelectorAll('ul li');

    console.log('list length', list.length);

    if (list.length === 4) {
        return getItemInfo(user, list[2]);
    }

    if (list.length === 3) {

        const containerX = presentation.getBoundingClientRect().x;
        const itemX = list[1].getBoundingClientRect().x;

        if (itemX < containerX) {
            return getItemInfo(user, list[2]);
        }

        return getItemInfo(user, list[1]);
    }

    showMessage('Not found presentation list');
};

// item in home page list
const getHomeInfo = (downloadArticle) => {
    const head = downloadArticle.firstChild.childNodes[0];
    const a = head.querySelector('a');
    if (!a) {
        showMessage('Not found user');
        return;
    }
    const pathname = new URL(a.href).pathname;
    const user = pathname.split('/')[1];
    console.log('user', user);

    const body = downloadArticle.firstChild.childNodes[1];

    const button = body.querySelector("[role='button']");
    if (!button) {
        showMessage('Not found button');
        return;
    }

    const presentation = button.querySelector("[role='presentation']");
    if (presentation) {
        return getListInfo(user, presentation);
    }

    return getItemInfo(user, button);
};


// item in popup
const getPopupInfo = (downloadArticle) => {

    const right = downloadArticle.firstChild.childNodes[1];
    const a = right.querySelector('header a');
    if (!a) {
        showMessage('Not found user');
        return;
    }
    const pathname = new URL(a.href).pathname;
    const user = pathname.split('/')[1];
    console.log('user', user);

    const left = downloadArticle.firstChild.childNodes[0];

    const button = left.querySelector("[role='button']");
    if (button) {
        return getItemInfo(user, button);
    }

    const presentation = left.querySelector("[role='presentation']");
    if (presentation) {
        return getListInfo(user, presentation);
    }

    showMessage('Not found button and presentation');

};


let downloadArticle;
let downloadTarget;

export default {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/',

    bindEvents: (showHelper, hideHelper) => {

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

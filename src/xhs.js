
const getUserId = () => {
    const $author = document.querySelector('.author-container');
    const href = $author.querySelector('a').href;
    const user = href.split('/').pop();
    return user;
};

const getImageInfo = (target) => {
    const bgi = target.style.backgroundImage;
    console.log(bgi);

    const url = bgi.split('("')[1].split('")')[0];
    console.log('image url', url);
    // http://sns-webpic-qc.xhscdn.com/202310131211/abde3ef35468fc78c30c433a1dcf8746/1040g00830pus52mf6i6g5p86vgr0houid08a1ug!nd_whlt34_webp_wm_1

    const id = url.split('/').pop().split('!')[0];
    console.log('id', id);

    const user = getUserId();
    console.log('user', user);

    const filename = `${user}-${id}`;

    return {
        url,
        filename
    };
};

const getVideoInfo = (target) => {
    const $video = target.parentNode.querySelector('video');
    const url = $video.src;
    console.log('video url', url);

    const id = url.split('?')[0].split('/').pop();
    console.log('id', id);

    const user = getUserId();
    console.log('user', user);

    const filename = `${user}-${id}`;

    return {
        url,
        filename
    };

};

const getDownloadType = (target) => {
    const cls = target.classList;
    console.log(cls);

    if (cls.contains('swiper-slide')) {
        return 'image';
    }

    if (cls.contains('xgplayer-poster')) {
        return 'video';
    }
};

let downloadTarget;
let downloadType;

export default {
    id: 'xiaohongshu',
    name: '小红书',
    url: 'https://www.xiaohongshu.com/',

    bindEvents: (showHelper, hideHelper) => {

        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            const type = getDownloadType(target);
            if (!type) {
                return;
            }

            downloadTarget = target;
            downloadType = type;

            showHelper(downloadTarget);

            const mouseleaveHandler = () => {
                if (downloadTarget) {
                    downloadTarget.removeEventListener('mouseleave', mouseleaveHandler);
                }
                downloadTarget = null;
                hideHelper();
            };

            downloadTarget.addEventListener('mouseleave', mouseleaveHandler);

        });

    },

    getDownloadInfo: () => {
        if (!downloadTarget) {
            return;
        }
        if (downloadType === 'image') {
            return getImageInfo(downloadTarget);
        }

        if (downloadType === 'video') {
            return getVideoInfo(downloadTarget);
        }
    }
};

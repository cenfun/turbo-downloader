
const getImageInfo = (target) => {
    const bgi = target.style.backgroundImage;
    console.log(bgi);

    const url = bgi.split('("')[1].split('")')[0];
    console.log('image url', url);
    // http://sns-webpic-qc.xhscdn.com/202310131211/abde3ef35468fc78c30c433a1dcf8746/1040g00830pus52mf6i6g5p86vgr0houid08a1ug!nd_whlt34_webp_wm_1

};

const getVideoInfo = (target) => {
    const $video = target.parentNode.querySelector('video');
    const url = $video.src;
    console.log('video url', url);


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

export default {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/',

    bindEvents: (showHelper) => {

        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            const type = getDownloadType(target);
            if (type) {
                showHelper(target, type);
            }
        });

    },

    getDownloadInfo: (target, type) => {
        if (type === 'image') {
            return getImageInfo(target);
        }

        if (type === 'video') {
            return getVideoInfo(target);
        }
    }
};
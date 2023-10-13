import { saveAs } from 'file-saver';

import css from './style.scss';

import svgDownload from './images/download.svg';

// global element
let $helper;
let $target;
let currentType;

const mouseleaveHandler = (e) => {

    $target.removeEventListener('mouseleave', mouseleaveHandler);
    $target = null;

    if ($helper.parentNode) {
        $helper.parentNode.removeChild($helper);
    }

};

const showHelper = (target, type) => {
    $target = target;
    currentType = type;
    $target.appendChild($helper);
    $target.addEventListener('mouseleave', mouseleaveHandler);
};

const getUserId = () => {
    const $author = document.querySelector('.author-container');
    const href = $author.querySelector('a').href;
    const user = href.split('/').pop();
    return user;
};

const saveImage = () => {
    const bgi = $target.style.backgroundImage;
    console.log(bgi);

    const url = bgi.split('("')[1].split('")')[0];
    console.log('image url', url);
    // http://sns-webpic-qc.xhscdn.com/202310131211/abde3ef35468fc78c30c433a1dcf8746/1040g00830pus52mf6i6g5p86vgr0houid08a1ug!nd_whlt34_webp_wm_1

    const id = url.split('/').pop().split('!')[0];
    console.log('id', id);

    const user = getUserId();
    console.log('user', user);

    const filename = `${user}-${id}`;

    saveAs(url, filename);
};

const saveVideo = () => {
    const $video = $target.parentNode.querySelector('video');
    const url = $video.src;
    console.log('video url', url);

    const id = url.split('/').pop();
    console.log('id', id);

    const user = getUserId();
    console.log('user', user);

    const filename = `${user}-${id}`;

    saveAs(url, filename);

};


const saveHandler = (e) => {

    if (!$target) {
        return;
    }

    e.stopPropagation();

    if (currentType === 'image') {
        saveImage();
        return;
    }

    saveVideo();


};

const initialize = () => {

    // console.log(css);
    document.head.appendChild(document.createElement('style')).appendChild(document.createTextNode(css));


    // init helper
    $helper = document.createElement('div');
    $helper.className = 'downloader-helper-container';

    const iconDownload = document.createElement('div');
    iconDownload.innerHTML = svgDownload;
    $helper.appendChild(iconDownload);

    const label = document.createElement('span');
    label.innerHTML = 'save';
    $helper.appendChild(label);

    $helper.addEventListener('click', saveHandler);

    document.body.appendChild($helper);

    // init events
    document.addEventListener('mouseover', (e) => {

        const target = e.target;
        const cls = target.classList;
        // console.log(cls);

        if (cls.contains('swiper-slide')) {
            showHelper(target, 'image');
            return;
        }

        if (cls.contains('xgplayer-poster')) {
            showHelper(target, 'video');
        }


    });

};


window.addEventListener('load', () => {

    initialize();

});

import { saveAs } from 'file-saver';

import css from './style.scss';

import svgDownload from './images/download.svg';

// global element
let $helper;
let $target;

const mouseleaveHandler = (e) => {

    $target.removeEventListener('mouseleave', mouseleaveHandler);
    $target = null;

    if ($helper.parentNode) {
        $helper.parentNode.removeChild($helper);
    }

};

const showHelper = (target) => {
    $target = target;
    $target.appendChild($helper);
    $target.addEventListener('mouseleave', mouseleaveHandler);
};

const saveImage = () => {
    if (!$target) {
        return;
    }

    const bgi = $target.style.backgroundImage;
    console.log(bgi);

    const url = bgi.split('("')[1].split('")')[0];
    console.log('save image', url);
    // http://sns-webpic-qc.xhscdn.com/202310131211/abde3ef35468fc78c30c433a1dcf8746/1040g00830pus52mf6i6g5p86vgr0houid08a1ug!nd_whlt34_webp_wm_1

    const id = url.split('/').pop().split('!')[0];
    console.log('id', id);

    const $author = document.querySelector('.author-container');
    const href = $author.querySelector('a').href;
    const user = href.split('/').pop();
    console.log('user', user);

    const filename = `${user}-${id}`;

    saveAs(url, filename);

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

    $helper.addEventListener('click', (e) => {
        e.stopPropagation();
        saveImage();
    });

    document.body.appendChild($helper);

    // init events
    document.addEventListener('mouseover', (e) => {

        const target = e.target;
        if (!target.classList.contains('swiper-slide')) {
            return;
        }

        showHelper(target);

    });

};


window.addEventListener('load', () => {

    initialize();

});

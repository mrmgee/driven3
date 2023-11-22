const path = require("path");
const Image = require('@11ty/eleventy-img');

const sizesResp = "(min-width: 930px) 932px, 100vw";

const imageShortcode = async (
  src,
  alt,
  classVar,
  sizesResp,
  widths = [400, 600, 800, 1280, 1440],
  formats = ['jpeg'],
  sizes = '(min-width: 440px) 100vw, 1280px'
  //'(min-width: 768px) 100vw, calc(100vw - 24px),'
//  '(min-width: 1420px) 660px, (min-width: 1220px) 564px, (min-width: 1040px) 468px, (min-width: 780px) 50vw, calc(100vw - 24px)'
//  '(min-width: 1420px) 318px, (min-width: 1220px) 270px, (min-width: 1040px) 222px, (min-width: 780px) calc(25vw - 18px), calc(100vw - 24px)'
//  sizes = '(min-width: 768px) 600px, 100vw'
//   sizes = '(min-width: 930px) 932px, 100vw'
) => {
    const imageMetadata = await Image(src, {
        widths: [...widths, null],
        formats: [...formats, null],
        filenameFormat: function (hash, src, width, format, options) {
            const { name } = path.parse(src);
            return `${name}-${width}.${format}`;
        },
        outputDir: 'dist/assets/images',
        urlPath: '/assets/images',
        sizes: sizesResp,
      });

      if (classVar === undefined) {
        imageAttributesTemp = {
            alt,
            sizes,
            loading: "lazy",
            decoding: "async",
        };
      } else {
         imageAttributesTemp = {
            class: classVar,
            alt,
            sizes: sizesResp,
            loading: "lazy",
            decoding: "async",
        };
        }
        imageAttributes = imageAttributesTemp;

    
      return Image.generateHTML(imageMetadata, imageAttributes);
      
};



//GALLERY thumbs to fullscreen

// gallery shortcode function
const sharp = require('sharp');


const GALLERY_IMAGE_WIDTH = 400;
const LANDSCAPE_LIGHTBOX_IMAGE_WIDTH = 1200;   //orig 2000 width
const PORTRAIT_LIGHTBOX_IMAGE_WIDTH = 720;

async function galleryImageShortcode(src, alt) {
    let lightboxImageWidth = LANDSCAPE_LIGHTBOX_IMAGE_WIDTH;

    const metadata = await sharp(src).metadata();
    if (metadata.orientation > 1) {
        console.log('Rotated image detected:', src, metadata.orientation);
        await sharp(src).rotate().toFile(`correct/${src.split("/").pop()}`);
    }

    if(metadata.height > metadata.width) {
        lightboxImageWidth = PORTRAIT_LIGHTBOX_IMAGE_WIDTH;
    }

    const options = {
        formats: ['jpeg'],
        widths: [GALLERY_IMAGE_WIDTH, lightboxImageWidth],
        filenameFormat: function (hash, src, widths, formats, options) {
            const { name } = path.parse(src);
            return `${name}-${widths}.${formats}`;
        },

        // urlPath: "/gallery/",
        // outputDir: './_site/gallery/'

        outputDir: 'dist/assets/images',
        urlPath: '/assets/images'

    }

    const genMetadata = await Image(src, options);

    return `
        <a class="myClass12" href="${genMetadata.jpeg[1].url}" 
        data-pswp-width="${genMetadata.jpeg[1].width}" 
        data-pswp-height="${genMetadata.jpeg[1].height}" 
        target="_blank">
            <img src="${genMetadata.jpeg[0].url}" alt="${alt}" />
            <span class="hidden-caption-content">${alt}</span>
            <div class="card-overlay">
                <div class="control">
                    view larger
                    <img src="/assets/images/i-link-arr.png" alt="Click to view larger">
                </div>
            </div>
        </a>
    `.replace(/(\r\n|\n|\r)/gm, "");;
}


// gallery shortcode
function galleryShortcode(content, name) {
  return `

              ${content}

          <script type="module">
          import PhotoSwipeLightbox from '/assets/js/photoswipe-lightbox.esm.js';
          const options = {
            gallery:'#gallery-${name}',
            children:'a',
            
            pswpModule: () => import('/assets/js/photoswipe.esm.js')
          };
          const lightbox = new PhotoSwipeLightbox(options);
          lightbox.on('uiRegister', function() {
            lightbox.pswp.ui.registerElement({
              name: 'custom-caption',
              order: 9,
              isButton: false,
              appendTo: 'root',
              html: 'Caption text',
              onInit: (el, pswp) => {
                lightbox.pswp.on('change', () => {
                  const currSlideElement = lightbox.pswp.currSlide.data.element;
                  let captionHTML = '';
                  if (currSlideElement) {
                    const hiddenCaption = currSlideElement.querySelector('.hidden-caption-content');
                    if (hiddenCaption) {

                      captionHTML = hiddenCaption.innerHTML;
                    } else {
 
                      captionHTML = currSlideElement.querySelector('img').getAttribute('alt');
                    }
                  }
                  el.innerHTML = captionHTML || '';
                });
              }
            });
          });
          lightbox.init();
          </script>
  `.replace(/(\r\n|\n|\r)/gm, "");
}










module.exports = function (eleventyConfig) {

    const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addPassthroughCopy("src/assets/css/");
    eleventyConfig.addPassthroughCopy("src/assets/js/");
    eleventyConfig.addPassthroughCopy("src/assets/images/");

    // Image plugin and shortcode
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);


    // Order serviceItems collection
    eleventyConfig.addCollection("service", collection =>
    collection
        .getFilteredByTag("service")
        .filter(function(item) {
        return "serviceItems" in item.data;
        })
        .sort((a, b) => {
        return (a.data.serviceItems.order || 0) - (b.data.serviceItems.order || 0);
        })
    );

    // Order performanceUpgrades collection
    eleventyConfig.addCollection("performanceUpgrades", collection =>
    collection
    //   .getAll()
        .getFilteredByTag("performanceUpgrades")
        .filter(function(item) {
          return "performanceUpgradesItems" in item.data;
        })
        .sort((a, b) => {
          return (a.data.performanceUpgradesItems.order || 0) - (b.data.performanceUpgradesItems.order || 0);
        })
    );

    // gallery and shortcode   
    eleventyConfig.addPairedNunjucksShortcode('gallery', galleryShortcode);
    eleventyConfig.addNunjucksAsyncShortcode('galleryImage', galleryImageShortcode);

    return {
      dir: {
        input: 'src',
        output: 'dist',
        includes: '_includes',
        layouts: '_layouts'
      }

    };
  };
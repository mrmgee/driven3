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


module.exports = function (eleventyConfig) {

    const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addPassthroughCopy("src/assets/css/");
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

    return {
      dir: {
        input: 'src',
        output: 'dist',
        includes: '_includes',
        layouts: '_layouts'
      }

    };
  };
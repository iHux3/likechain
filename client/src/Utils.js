class Utils 
{
    static getParam(pos = 0)
    {
        const url = Utils.removeSlash(window.location.pathname).split("/");
        url.shift();
        return url[pos] || "";
    }

    static removeSlash(str)
    {
        return str[str.length - 1] === "/" ? str.slice(0, -1) : str;
    }

    static getImages(rawImages)
    {
        const images = [];
        for (let i = 0; i < rawImages[0].length; i++) {
            const image = Object.assign({}, rawImages[0][i]);
            image.isLiked = rawImages[1][i];
            image.id = rawImages[2][i];
            images.push(image);
        }
        return images;
    }
}

export default Utils;
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
}

export default Utils;
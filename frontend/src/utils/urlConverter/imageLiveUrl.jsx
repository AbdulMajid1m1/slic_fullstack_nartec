import { backendUrl } from "../config";

function imageLiveUrl(documentPath) {
    if (typeof documentPath !== 'string' || !documentPath) return null;

    // Replace all backslashes with forward slashes
    let cleanedPath = documentPath.replace(/\\/g, '/');

    // Remove any leading or trailing slashes from the cleaned path
    cleanedPath = cleanedPath.replace(/^\/+|\/+$/g, '');

    // Ensure there's only one slash between the backendUrl and cleanedPath
    const liveUrl = `${backendUrl.replace(/\/+$/,'')}/${cleanedPath}`;

    return liveUrl;
}

export default imageLiveUrl;

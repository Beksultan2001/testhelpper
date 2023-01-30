
export function generateID() {
    return Math.random().toString(36).substr(2, 16);
}

export function isRussian(str) {
    return /[^\x00-\x7F]/.test(str);
} 

export function mixArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

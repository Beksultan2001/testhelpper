
export function generateID() {
    return Math.random().toString(36).substr(2, 16);
}

export function isRussian(str) {
    return /[^\x00-\x7F]/.test(str);
} 


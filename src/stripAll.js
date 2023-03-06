const stripAll = (string) => {
    return string.replaceAll('.', '').replaceAll('-', '')
}

module.exports = stripAll
// utils/caseConvert.js
function toCamelCase(row) {
    if (!row) return row;
    const result = {};
    for (const [key, value] of Object.entries(row)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase()
        );
        result[camelKey] = value;
    }
    return result;
}

function toCamelCaseRows(rows) {
    return rows.map(toCamelCase);
}

module.exports = { toCamelCase, toCamelCaseRows };

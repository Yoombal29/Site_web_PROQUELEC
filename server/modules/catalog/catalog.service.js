const repo = require('./catalog.repository');

function getAll(table, orderBy) {
    return () => repo.queryAll(table, orderBy);
}

function getById(table) {
    return (id) => repo.queryByCondition(table, 'id = $1', [id]);
}

function create(table, columns) {
    return (data) => {
        const values = columns.map(c => data[c]);
        const placeholders = columns.map((_, i) => `$${i + 1}`);
        return repo.insertOne(table, columns, values, placeholders);
    };
}

function update(table, columns) {
    return (id, data) => {
        const values = columns.map(c => data[c]);
        return repo.updateOne(table, id, columns, values);
    };
}

function remove(table) {
    return (id) => repo.deleteOne(table, id);
}

// --- Electrical Standards ---
async function getByCode(code) {
    const std = await repo.findByCode(code);
    if (!std) throw Object.assign(new Error('Norme non trouvée'), { status: 404 });
    return std;
}

async function search(query) {
    if (!query) return repo.queryAll('electrical_standards', 'code ASC LIMIT 50');
    return repo.searchStandards(query);
}

module.exports = {
    getAll, getById, create, update, remove, getByCode, search,
};

const cupons = (data, mysql, callback) => {
    mysql.query({
        sql: `UPDATE parceiro_${data.id_parceiro} SET cupons = ? WHERE id_cliente = ?`,
        timeout: 40000,
        values: [
            data.total,
            data.id_cliente
        ]
    }, (error, results) => {
        if (error) console.error(error)
        callback()
    })
}


module.exports = cupons;
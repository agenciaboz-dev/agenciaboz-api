const getLojas = async (cliente, mysql) => {
    const lojas = []
    mysql.query({
        sql: `SELECT COUNT(*) FROM parceiros`,
        timeout: 40000, // 40s
    }, (error, results) => {
        if (error) console.error(error);
        const count = results[0]['COUNT(*)']
        for (let i = 0; i < count; i++) {
            mysql.query({
                sql: `SELECT * FROM parceiro_${i} WHERE id_cliente = ${cliente.id}`,
                timeout: 40000
            }, (error, results) => {
                if (error) console.error(error);
                const loja = results[0]
                if (loja) {
                    lojas.push(loja)
                }
                if (i == count-1) return lojas
            })
        }
    })
}


module.exports = getLojas;
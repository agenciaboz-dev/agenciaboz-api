const getLojas = (cliente, mysql) => {
    const lojas = []
    mysql.query({
        sql: `SELECT COUNT(*) FROM parceiros`,
        timeout: 40000, // 40s
    }, (error, results) => {
        if (error) console.error(error);
        console.log(results)
    })
}


module.exports = getLojas;
const historico = (historico_raw, alvo) => {
    const historicos = []
    for (let item of historico_raw) {
        historicos.push({
            ...item,
            nome: item[`nome_${alvo}`],
            operacao: item.quantidade > 0 ? 'Adicionado' : 'Removido',
            alvo
        })
    }
    return historicos
}


module.exports = historico;
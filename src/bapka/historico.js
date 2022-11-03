const historico = (historico_raw, alvo) => {
    const historicos = []
    for (let item of historico_raw) {
        historicos.push({
            ...item,
            nome: alvo == 'parceiro' ? item[`nome_${alvo}`] : item[`nome_${alvo}`].split(' ')[0],
            operacao: item.quantidade > 0 ? 'Adicionado' : 'Removido',
            id: item[`id_${alvo}`],
            alvo
        })
    }
    return historicos
}


module.exports = historico;
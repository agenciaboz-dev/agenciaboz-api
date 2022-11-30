const express = require('express');
const router = express.Router();
const config = require('../../config.json')


/* GET users listing. */
router.post('/', (request, response, next) => {    
	const address = request.body;

	const data = {
        "codigoConfirmacaoColeta": null,
        "codigoExterno": address.id,

        //Opcional, pois consulta o endereço da loja, mas caso o endereço seja diferente pode informar
        // "enderecoColeta": {
        //     "bairro": "Jardim Caboré",
        //     "cep": "09230110",
        //     "cidade": "São Paulo",
        //     "complemento": "Loja 9 e 10",
        //     "estado": "X",
        //     "numero": "2050",
        //     "rua": "Rua Doutor Luiz Migliano"
        // },
        
        //"usuarioOrigemId": 15468,//Esse é o id retornado no método de login, caso não informado irá criar com o usuário do token, 
        // caso seja informado por exemplo um usuário matriz no token e deseja criar pedido com filial, basta passar aqui
        "minutosTempoDePreparo": null,
        "ordenarMelhorRota": true,
        "pagamentoOnline": true,
        "pedidoEntrega": [
            {
            "endereco": {
                "bairro": address.bairro,
                "cep": address.cep,
                "cidade": address.cidade,
                "complemento": address.complemento,
                "estado": address.estado,
                "numero": address.numero,
                "rua": address.rua
                },
            "idExterno": address.id,
            "nome": address.nome,
            "observacao": "",
            "pagamentoOnline": true,
            "telefone": address.telefone
            }
        ]
    }

    response.json(data)

});

module.exports = router;
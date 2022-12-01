jQuery(document).ready(function($) {
    if (jQuery(document).attr('title').split(' – ')[0] == 'Resumo do Pedido') {

		const address = {
            nome: jQuery.trim(jQuery("address").html().split("<br>")[0]),
            rua: jQuery.trim(jQuery("address").html().split("<br>")[1]),
            numero: jQuery.trim(jQuery("address").html().split("<br>")[2]),
            complemento: jQuery.trim(jQuery("address").html().split("<br>")[3]),
            bairro: jQuery.trim(jQuery("address").html().split("<br>")[4]),
            cidade: jQuery.trim(jQuery("address").html().split("<br>")[5]),
            estado: jQuery.trim(jQuery("address").html().split("<br>")[6]),
            cep: jQuery.trim(jQuery("address").html().split("<br>")[7]).split('\n')[0].replaceAll('-', ''),
            telefone: jQuery('.woocommerce-customer-details--phone').text(),
            email: jQuery('.woocommerce-customer-details--email').text(),

            id: jQuery(jQuery('strong')[0]).text(),
            dinheiro: jQuery(jQuery('strong')[3]).text()
        }

        if (address.complemento == "Complemento:") {
            address.complemento = ""
        }

		jQuery.ajax({
            method: "POST",
            url: "https://app.agenciaboz.com.br:4000/api/v1/bapka/mottu",
            data: address
            })
            .done(response => {
                console.log(response)
            })

}})
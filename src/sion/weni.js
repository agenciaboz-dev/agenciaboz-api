const axios = require("axios")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const api = axios.create({
    baseURL: "https://flows.weni.ai/api/v2",
    timeout: 1000 * 10,
})

const API_TOKEN = "364c484591cf1a6f6097bcbad8b9bcf24d0da6b7"

api.add = (financial) => {
    const data = {
        name: financial.name,
        urns: [`tel:+55${financial.phone}`, `mailto:${financial.email}`],
        fields: {
            senhacopel: financial.password,
            emailcopel: financial.login,
            telefone: financial.phone,
            email: financial.email,
        },
    }

    api.post("/contacts.json", data, { headers: { Authorization: `Token ${API_TOKEN}` } })
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error))
}

module.exports = api

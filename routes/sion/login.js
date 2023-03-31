const express = require('express')
const router = express.Router();
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

router.post('/', async (request, response, next) => {    
    const data = request.body

    const adm = await prisma.adms.findFirst({
        where: {
            OR: [
                {username: data.user},
                {email: data.user},
            ],
            AND: {
                password: data.password
            }
        }
    })

    if (adm) response.json(adm)

    const user = await prisma.users.findFirst({
        where: {
            OR: [
                {username: data.user},
                {email: data.user},
            ],
            AND: {
                password: data.password
            }
        }
    })

    response.json(user)
   
});

module.exports = router
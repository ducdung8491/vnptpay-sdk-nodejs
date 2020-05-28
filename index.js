const https = require('https')
const crypto = require('crypto')

class Client {
    constructor(config) {
        this.serviceID = config.serviceID
        this.apiKey = config.apiKey
        this.secretKey = config.secretKey
        this.host = config.dev === true ? 'sandbox.vnptpay.vn' : 'api.vnptpay.vn'
        this.version = '1.0.5'
    }

    createTransaction(data) {
        let body = {
            ACTION: 'INIT',
            VERSION: this.version,
            MERCHANT_SERVICE_ID: this.serviceID,
            MERCHANT_ORDER_ID: data.order_id,
            AMOUNT: data.amount,
            AMOUNT_DETAIL: `${data.amount}`,
            SERVICE_ID: "1",
            DEVICE: 1,
            LOCALE: data.locale,
            CURRENCY_CODE: data.currency_code,
            PAYMENT_METHOD: data.payment_method,
            DESCRIPTION: data.description,
            CREATE_DATE: data.create_time,
            CLIENT_IP: data.client_ip
        }
        let secureCode = this.sign([
            ...Object.values(body),
            this.secretKey
        ].join('|'))
        body = { ...body, SECURE_CODE: secureCode }
        return this.request({
            method: 'POST',
            endpoint: '/init',
            body
        }).then(res => res.REDIRECT_URL)
    }

    queryTransaction(data) {
        let body = {
            ACTION: 'QUERY',
            VERSION: this.version,
            MERCHANT_SERVICE_ID: this.serviceID,
            MERCHANT_ORDER_ID: data.order_id,
            CREATE_DATE: data.create_time
        }
        let secureCode = this.sign([
            ...Object.values(body),
            this.secretKey
        ].join('|'))
        body = {...body, SECURE_CODE: secureCode}
        return this.request({
            method: 'POST',
            endpoint: '/query_transaction',
            body
        }).then(data => ({
            order_id: data.MERCHANT_ORDER_ID,
            transaction_id: data.VNPTPAY_TRANSACTION_ID,
            amount: data.AMOUNT,
            locale: data.LOCALE,
            currency_code: data.CURRENCY_CODE,
            payment_method: data.PAYMENT_METHOD,
            pay_date: data.PAY_DATE,
            transaction_status: data.TRANSACTION_STATUS,
            description: data.ADDITIONAL_INFO
        }))
    }

    path(endpoint) {
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`
        }
        return `/rest/payment/v${this.version}${endpoint}`
    }

    request(request) {
        let executor = (resolve, reject) => {
            let options = {
                host: this.host,
                port: 443,
                method: request.method,
                path: this.path(request.endpoint),
                agent: new https.Agent({ keepAlive: false, rejectUnauthorized: false })
            }
            let req = https.request(options, res => {
                let body = []
                res.setEncoding('utf-8')
                res.on('data', data => { body.push(data) })
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        reject(new Error('Failed to request'))
                        return
                    }
                    let resText = body.join('')
                    let payload
                    try {
                        payload = JSON.parse(resText)
                    } catch (err) {
                        reject(new Error('Failed to parse response'))
                        return
                    }
                    let { RESPONSE_CODE, DESCRIPTION, SECURE_CODE, ...data } = payload
                    if (RESPONSE_CODE !== '00') {
                        reject(new Error(DESCRIPTION))
                        return
                    }
                    resolve(data)
                })
            })
            req.on('error', err => {
                reject(new Error(err.message))
            })
            req.setHeader('Content-Type', 'application/json')
            req.setHeader('Authorization', `Bearer ${this.apiKey}`)
            console.log(request.body)
            if (request.body) {
                let data = request.body
                if (typeof data === 'object') data = JSON.stringify(data)
                req.write(data)
            }
            req.end()
        }
        return new Promise(executor)
    }

    sign(data) {
        return crypto.createHash('sha256').update(data).digest('hex')
    }
}

module.exports = Client

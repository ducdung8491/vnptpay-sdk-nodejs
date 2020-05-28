# Vnptpay APIs NodejS Client

Client library for using Vnptpay APIs

* [Cài đặt](#cai-dat)
* [Vnptpay Client](#vnptpay-client)
* [Khởi tạo giao dịch](#khoi-tao-giao-dich)
* [Truy vấn giao dịch](#truy-van-giao-dich)

## Cài đặt

``` js
npm install @npay/vnptpay
```

## Vnptpay Client

``` js
const Client = require('@npay/vnptpay')

const client = new Client({
    serviceID: 6901,
    apiKey: 'acf392daf78c3cbeeb9705dab9a63219',
    secretKey:: '36e3c5b5a6d53fce2a2cc23d46ee5988',
    dev: true // Options, true nếu dùng để dev
})
```

## Khởi tạo giao dịch

``` js
const paymentLink = async client.createTransaction({
    order_id: 'OID-009', // Mã đơn hàng cần thanh toán
    amount: 69000,
    currency_code: 'VND',
    payment_method: 'VNPTPAY',
    description: 'Mô tả yêu cầu thanh toán',
    create_date: '20200222022222',
    client_ip: '127.0.0.1'
    locale: 'vi-VN'
})
```

## Truy vấn giao dịch

``` js
const transaction = async client.queryTransaction({
    order_id: 'OID-009',
    create_time: '20200222022222'
})
```

### Giao dịch trả về gồm các thông tin.

``` js
{
    order_id: 'OID-009',
    transaction_id: '',
    amount: 69000,
    locale: 'vi-VN',
    currency_code: 'VND',
    payment_method: 'VNPTPAY',
    pay_date: '20200222022222',
    transaction_status: '',
    description: 'Mô tả giao dịch'
}
```

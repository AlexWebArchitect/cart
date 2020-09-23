import React, { useState, useEffect } from 'react'
import axios from 'axios'

const params = {
  node: '48955',
  is_async: false,
  get_params: {
    base_url: 'https://designer.fstrk.io/',
    bot_key: 'c7736d90-a435-4f22-920a-1f5d9ce77fb3',
    cart_variable: 'cart-8f23fa09-c277-424a-9604-f5dd1c859bea',
    chat_uuid: 'e97e9588-ffed-4af6-9095-23a26ec8555c',
    ecommerce: '8f23fa09-c277-424a-9604-f5dd1c859bea',
    ecommerce_url: 'https://fasttrack-ecom-fashion.flex.fstrk.io',
    is_async: false,
    on_clear_node: null,
    on_close_url:
      'https://refer.id/?bot=demo_webview_bot&platform=telegram&verbose_name=Бот для собеседований&is_close_url=1',
    on_success_node: '48955',
    primary_color: '0d92d2',
    widget_origin: null,
  },
}

const api = {
  variables: `${params.get_params.base_url}api/partners/chats/${params.get_params.chat_uuid}/variables/`,
  push: `${params.get_params.base_url}api/partners/chats/${params.get_params.chat_uuid}/push/`,
}

axios.defaults.headers.common['bot-key'] = params.get_params.bot_key

const calcPrice = (products) => {
  return products.reduce((acc, cur) => {
    return acc + cur.quantity * cur.price
  }, 0)
}

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get(api.variables).then((res) => {
      setProducts(res.data[params.get_params.cart_variable].products)
    })
  }, [])

  const updateQuantity = (id, quantity) => {
    const updatedProducts = quantity
      ? products.map((product, index) =>
          index === id ? { ...product, quantity } : product
        )
      : products.filter((product, index) => index !== id)
    axios.post(api.variables, {
      [params.get_params.cart_variable]: { products: updatedProducts },
    })
    setProducts(updatedProducts)
  }

  const push = () => {
    axios.post(api.push, params)
    window.location.href = params.get_params.on_close_url
  }

  return (
    <ul>
      {products.length &&
        products.map((product, index) => {
          const { guid, title, price, quantity } = product
          return (
            <li key={guid}>
              {`${title} ${price} руб. `}
              <button
                onClick={() => {
                  updateQuantity(index, quantity - 1)
                }}
              >
                -
              </button>
              {quantity}
              <button
                onClick={() => {
                  updateQuantity(index, quantity + 1)
                }}
              >
                +
              </button>
            </li>
          )
        })}
      <li key={'price'}>{`Цена: ${calcPrice(products)} руб.`}</li>
      <li key={'button'}>
        <button onClick={push}>Оформить заказ</button>
      </li>
    </ul>
  )
}

export default App

import React, { useState, useEffect } from 'react'
import axios from 'axios'

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

const paramsToObject = (entries) => {
  let result = {}
  for (let entry of entries) {
    const [key, value] = entry
    result[key] = value
  }
  return result
}

const params = {
  node: urlParams.get('on_success_node'),
  get_params: paramsToObject(urlParams.entries()),
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
      setProducts(res.data[`cart-${params.get_params.ecommerce}`].products)
    })
  }, [])

  const updateQuantity = (id, quantity) => {
    const updatedProducts = quantity
      ? products.map((product, index) =>
          index === id ? { ...product, quantity } : product
        )
      : products.filter((product, index) => index !== id)
    axios.post(api.variables, {
      [`cart-${params.get_params.ecommerce}`]: { products: updatedProducts },
    })
    setProducts(updatedProducts)
  }

  const push = () => {
    axios.post(api.push, params).then(() => {
      window.location.href = params.get_params.on_close_url
    })
  }

  if (!queryString) {
    return 'add get params in url'
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

import React from 'react'

import { OrderAddressNotFound } from 'components/orders/OrderNotFound'
import { Wrapper } from './styled'

const SearchNotFound: React.FC = () => {
  return (
    <Wrapper>
      <OrderAddressNotFound />
    </Wrapper>
  )
}

export default SearchNotFound

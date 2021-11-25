import React from 'react'

import { OrderAddressNotFound } from 'components/orders/OrderNotFound'
import { WrapperPage } from './styled'

const SearchNotFound: React.FC = () => {
  return (
    <WrapperPage>
      <OrderAddressNotFound />
    </WrapperPage>
  )
}

export default SearchNotFound

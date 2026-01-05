import { useSelector } from 'react-redux';

import ProductItem from './ProductItem';
import classes from './Products.module.css';

const PRODUCTS = [
  {
    title: "First book",
    price: 7,
    description: "This is my first book",
  },
  {
    title: "Second book",
    price: 14,
    description: "This is my second book",
  },
];

const Products = (props) => {

  return (
    <section className={classes.products}>
      <h2>Buy your favorite products</h2>
      <ul>
        {
          PRODUCTS.map((product, index) => (
          <ProductItem {...product} key={index} />
        ))}
      </ul>
    </section>
  );
};

export default Products;

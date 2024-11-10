import React, { Component } from 'react';
import axios from 'axios';
import ProductList from './ProductList';
import NewProductForm from './NewProductForm';
import ProductDetail from './ProductDetail';
import AddProduct from './AddProduct';
import EditProductForm from './EditProductForm';

// Fetch backend URL from environment variables or fall back to a default
const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000';

class ProductControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisibleOnPage: false,
            actualProductList: [],
            selectedProduct: null,
            editProduct: false,
            uploadPhoto: null
        };
    }

    componentDidMount() {
        axios.get(`${backendApiUrl}/api/products`)
            .then(res => {
                console.log(res);
                this.setState({
                    actualProductList: res.data
                });
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }

    handleEditProductClick = () => {
        console.log('HandleEditClick reached!!');
        this.setState({
            editProduct: true
        });
    }

    handleAddButtonClick = (id) => {
        const BuyProduct = this.state.actualProductList.find(product => product._id === id);
        BuyProduct.quantity = BuyProduct.quantity - 1;
        if (BuyProduct.quantity <= 0) {
            BuyProduct.quantity = "Product is not Available";
        }
        this.setState({
            selectedProduct: BuyProduct
        });
    }

    handleClick = () => {
        if (this.state.editProduct) {
            this.setState({ editProduct: false });
        } else if (this.state.selectedProduct != null) {
            this.setState({
                formVisibleOnPage: false,
                selectedProduct: null
            });
        } else {
            this.setState(prevState => ({
                formVisibleOnPage: !prevState.formVisibleOnPage
            }));
        }
    }

    handleAddingNewProduct = (newProduct) => {
        console.log("Adding new product:", newProduct);
        axios.post(`${backendApiUrl}/api/products`, newProduct)
            .then(res => {
                console.log("Product added:", res.data);
                this.setState(prevState => ({
                    actualProductList: [...prevState.actualProductList, res.data]
                }));
            })
            .catch(error => {
                console.error("Error adding product:", error);
            });
        this.setState({
            formVisibleOnPage: false
        });
    };

    handleDeletingProduct = (id) => {
        axios.delete(`${backendApiUrl}/api/products/${id}`)
            .then(res => console.log(res.data))
            .catch(error => {
                console.log(error);
            });
        this.setState({
            actualProductList: this.state.actualProductList.filter(product => product._id !== id),
            formVisibleOnPage: false,
            selectedProduct: null
        });
    }

    handleChangingSelectedProduct = (id) => {
        console.log(id);
        const selectedProduct = this.state.actualProductList.find(product => product._id === id);
        this.setState({ selectedProduct: selectedProduct });
    }

    handleEditingProduct = (editedProduct) => {
        axios.put(`${backendApiUrl}/api/products/${this.state.selectedProduct._id}`, editedProduct)
            .then(res => console.log(res.data));

        this.setState({
            editProduct: false,
            formVisibleOnPage: false
        });
        window.location = '/';
    }

    render() {
        let currentlyVisibleState = null;
        let buttonText = null;
        
        if (this.state.editProduct) {
            currentlyVisibleState = <EditProductForm product={this.state.selectedProduct} onEditProduct={this.handleEditingProduct} />;
            buttonText = "Back to Product Detail";
        } else if (this.state.selectedProduct != null) {
            currentlyVisibleState = <ProductDetail product={this.state.selectedProduct} onBuyButtonClick={this.handleAddButtonClick} onDeleteProduct={this.handleDeletingProduct} onEditProductClick={this.handleEditProductClick} />;
            buttonText = "Back to product list";
        } else if (this.state.formVisibleOnPage) {
            currentlyVisibleState = <NewProductForm onNewProductCreation={this.handleAddingNewProduct} />;
            buttonText = "Back to product list";
        } else {
            currentlyVisibleState = <ProductList productList={this.state.actualProductList} onProductSelection={this.handleChangingSelectedProduct} />;
            buttonText = "Add a product";
        }
        
        return (
            <React.Fragment>
                <AddProduct buttonText={buttonText} whenButtonClicked={this.handleClick} />
                {currentlyVisibleState}
            </React.Fragment>
        );
    }
}

export default ProductControl;

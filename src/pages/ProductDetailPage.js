import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../redux/productSlice';
import { addToCart, addToGuestCart } from '../redux/cartSlice';
import axios from '../axios';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const product = useSelector((state) => state.products.currentProduct);
    const isLoggedIn = useSelector((state) => !!state.auth.token);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [variants, setVariants] = useState([]);
    const [combinedVariant, setCombinedVariant] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/products/${id}`);
                dispatch(fetchProductById(response.data.id));
                setVariants(response.data.variants || []);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [dispatch, id]);

    useEffect(() => {
        const variant = variants.find(
            (variant) => variant.color === selectedColor && variant.size === selectedSize
        );

        setCombinedVariant(variant);

        if (!variant && selectedColor && selectedSize) {
            setErrorMessage('The selected combination is unavailable. Please choose a different size or color.');
        } else {
            setErrorMessage('');
        }
    }, [selectedColor, selectedSize, variants]);

    const handleAddToCart = async () => {
        // If there are variants, ensure a variant is selected or allow direct product addition
        if (variants.length > 0 && !combinedVariant) {
            setErrorMessage('Please select a valid variant.');
            return;
        }

        // Calculate total price including product price and variant adjustment
        const totalPrice = (Number(product.price) || 0) + (combinedVariant ? Number(combinedVariant.price_adjustment) || 0 : 0);
        console.log(totalPrice); // This will log the total price correctly

        const item = {
            id: product.id,
            name: product.name,
            price: totalPrice, // Use the calculated total price
            image: combinedVariant?.image_url || product.image,
            quantity,
            product_variant_id: combinedVariant ? combinedVariant.id : null, // Include the selected variant ID if applicable
            product_variant: combinedVariant ? {
                id: combinedVariant.id,
                color: combinedVariant.color,
                size: combinedVariant.size,
                // Add other necessary fields here
            } : null, // Set to null if no variant is selected
        };

        if (isLoggedIn) {
            try {
                // Pass the entire item object in the payload
                await axios.post(`/api/cart/addtocart/${product.id}`, item);
                dispatch(addToCart(item)); // Use the correct item with total price
                navigate('/cart');
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        } else {
            dispatch(addToGuestCart(item)); // Same here for guest cart
            navigate('/cart');
        }
    };

    if (!product) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" />
                <p>Loading...</p>
            </Container>
        );
    }

    const uniqueColors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))];
    const uniqueSizes = [...new Set(variants.map((variant) => variant.size))];

    const displayedPrice =
        (Number(product.price) || 0) + (combinedVariant ? Number(combinedVariant.price_adjustment) || 0 : 0);

    return (
        <Container className="my-5">
            <Row className="product-details-row">
                <Col md={6} className="text-center">
                    <Card>
                        <Card.Img
                            variant="top"
                            src={`${process.env.REACT_APP_API_URL}/storage/${combinedVariant?.image_url || product.image}`}
                            alt={product.name}
                            className="product-image"
                        />
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="product-details-card border-0 shadow">
                        <Card.Body>
                            <Card.Title className="product-title">{product.name}</Card.Title>
                            <Card.Text className="product-price text-warning">
                                ${(displayedPrice).toFixed(2)}
                            </Card.Text>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <strong>Description:</strong> {product.description}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Category:</strong> <Badge bg="secondary">{product.category.name}</Badge>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Stock:</strong> {product.stock > 0 ? product.stock : 'Out of Stock'}
                                </ListGroup.Item>
                                
                                {/* Conditionally render color and size selection only if variants exist */}
                                {variants.length > 0 && (
                                    <>
                                        <ListGroup.Item>
                                            <strong>Choose Color:</strong>
                                            <div className="color-options">
                                                {uniqueColors.map((color, index) => (
                                                    <div key={index} className="color-option form-check form-check-inline">
                                                        <input
                                                            type="radio"
                                                            name="color"
                                                            id={`color-${index}`}
                                                            value={color}
                                                            className="form-check-input visually-hidden"
                                                            onChange={() => setSelectedColor(color)}
                                                        />
                                                        <label
                                                            htmlFor={`color-${index}`}
                                                            className="form-check-label"
                                                            style={{
                                                                display: 'inline-block',
                                                                width: '30px',
                                                                height: '30px',
                                                                borderRadius: '50%',
                                                                backgroundColor: color,
                                                                border:
                                                                    selectedColor === color
                                                                        ? '2px solid #000'
                                                                        : '2px solid transparent',
                                                                cursor: 'pointer',
                                                                margin: '0 5px',
                                                            }}
                                                        ></label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Choose Size:</strong>
                                            <div className="size-options">
                                                {uniqueSizes.map((size, index) => (
                                                    <div key={index} className="form-check form-check-inline">
                                                        <input
                                                            type="radio"
                                                            name="size"
                                                            id={`size-${index}`}
                                                            value={size}
                                                            className="form-check-input"
                                                            onChange={() => setSelectedSize(size)}
                                                        />
                                                        <label htmlFor={`size-${index}`} className="form-check-label">
                                                            {size}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ListGroup.Item>
                                    </>
                                )}
                            </ListGroup>

                            {errorMessage && (
                                <p
                                    className="text-warning mt-3"
                                    style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px' }}
                                >
                                    <strong>{errorMessage}</strong>
                                </p>
                            )}

                            <div className="d-flex align-items-center mt-3">
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                                    className="quantity-input me-2"
                                />
                                <Button
                                    variant="warning"
                                    className="btn-add-to-cart"
                                    onClick={handleAddToCart}
                                    disabled={!quantity || (variants.length > 0 && !combinedVariant)} // Allow button if no variants exist
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col>
                    <h3 className="customer-reviews-title">Customer Reviews</h3>
                    <p>No reviews yet.</p>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetails;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { setOrders } from '../../../redux/orderSlice';
import { Table, Spinner, Alert, Card } from 'react-bootstrap';
import './OrderDetails.css'; // Import custom CSS file for styling

const OrderDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const order = useSelector(state => 
        state.orders.items.find(order => order.id === parseInt(id))
    );

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`/api/admin/orders/${id}`);
                dispatch(setOrders([response.data]));
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };

        fetchOrderDetails();
    }, [id, dispatch]);

    // Loading and error handling
    if (!order) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading order details...</p>
            </div>
        );
    }

    return (
        <div className="order-details-container">
            <Card className="order-details-card">
                <Card.Body>
                    <Card.Title>Order Details for Order ID: {order.id}</Card.Title>
                    <Card.Text>
                        <strong>Name:</strong> {order.name} <br />
                        <strong>Email:</strong> {order.email} <br />
                        <strong>Total Price:</strong> {order.total_price} MAD <br />
                        <strong>Payment Method:</strong> {order.payment_method} <br />
                        <strong>Status:</strong> {order.status} <br />
                    </Card.Text>
                    <h4>Items:</h4>
                    {order.items.length === 0 ? (
                        <Alert variant="warning">No items in this order.</Alert>
                    ) : (
                        <Table striped bordered hover className="order-items-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.product.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price} MAD</td>
                                        <td>
                                            {item.product_variant ? (
                                                <div 
                                                    className="color-circle"
                                                    style={{
                                                        backgroundColor: item.product_variant.color // Set the background color
                                                    }}
                                                />
                                            ) : 'N/A'}
                                        </td>
                                        <td>{item.product_variant ? item.product_variant.size : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default OrderDetails;

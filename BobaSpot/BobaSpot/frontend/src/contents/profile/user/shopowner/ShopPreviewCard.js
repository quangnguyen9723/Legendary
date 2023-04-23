import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

import { v4 as uuid } from 'uuid';

// firebase
import { storage } from "../../../../services/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

import {
    Image, Button, Space,
    Form, Input, Select,
    TimePicker, DatePicker,
    Upload,
    InputNumber
} from 'antd';
import { UploadOutlined, InboxOutlined, StarOutlined } from '@ant-design/icons';
import axios from 'axios'

const { Option } = Select;
const { TextArea } = Input;

const ShopPreviewCard = (props) => {
    const {
        reviewText, shopData
    } = props;

    const navigate = useNavigate();

    // forms
    const [formCreateDrink] = Form.useForm();
    const [formChangeInfo] = Form.useForm();

    const [isHoverDeleteShop, setIsHoverDeleteShop] = useState(false);
    const [isHoverChangeShopInfo, setIsHoverChangeShopInfo] = useState(false);
    const [isHoverSubmitCreateShop, setIsHoverSubmitCreateShop] = useState(false);
    const [showChangeShopInfoOverlay, setShowChangeShopInfoOverlay] = useState(false);

    // change shop's info
    const [changeShopName, setChangeShopName] = useState('');
    const [changeShopAddress, setChangeShopAddress] = useState('');
    const [changeShopHour, setChangeShopHour] = useState([]);
    const [changeShopNumber, setChangeShopNumber] = useState('');

    // shop preview
    const [isHoverShopName, setIsHoverShopName] = useState(false);

    // create a drink
    const [isHoverCreateDrink, setIsHoverCreateDrink] = useState(false)
    const [showCreateDrinkOverlay, setShowCreateDrinkOverlay] = useState(false);
    const [newDrinkName, setNewDrinkName] = useState('');
    const [newDrinkDescription, setNewDrinkDescription] = useState('');
    const [newDrinkType, setNewDrinkType] = useState('')
    const [newDrinkPrice, setNewDrinkPrice] = useState();
    const [newDrinkImageFile, setNewDrinkImageFile] = useState(null);
    // retrieve url from firebase
    const [newDrinkImageUrl, setNewDrinkImageUrl] = useState(null);
    const [progresspercent, setProgresspercent] = useState(0);

    const handleShopNameMouseEnter = () => {
        setIsHoverShopName(true);
    }

    const handleShopNameMouseLeave = () => {
        setIsHoverShopName(false);
    }

    const handleDeleteShopMouseEnter = () => {
        setIsHoverDeleteShop(true);
    };

    const handleClickOnShopName = () => {
        navigate(`/bobaplace/${shopData.id}`)
    }

    const handleDeleteShopMouseLeave = () => {
        setIsHoverDeleteShop(false);
    };

    const handleChangeShopInfoMouseEnter = () => {
        setIsHoverChangeShopInfo(true);
    };

    const handleChangeShopInfoMouseLeave = () => {
        setIsHoverChangeShopInfo(false);
    };

    const handleCreateDrinkMouseEnter = () => {
        setIsHoverCreateDrink(true);
    }

    const handleCreateDrinkMouseLeave = () => {
        setIsHoverCreateDrink(false);
    }

    const handleHoverSubmitCreateShopEnter = () => {
        setIsHoverSubmitCreateShop(true);
    }

    const handleHoverSubmitCreateShopLeave = () => {
        setIsHoverSubmitCreateShop(false);
    }

    const handleShowChangeShopOverlay = () => {
        setShowChangeShopInfoOverlay(!showChangeShopInfoOverlay);
        setShowCreateDrinkOverlay(false);
    }

    const handleShowCreateDrinkOverlay = () => {
        setShowCreateDrinkOverlay(!showCreateDrinkOverlay);
        setShowChangeShopInfoOverlay(false);
    }

    const handleSubmitChangeShopInfo = () => {
        console.log(changeShopName);
        console.log(changeShopAddress);
        console.log(changeShopHour);
        console.log(changeShopNumber);

        const data = {
            shop_name: changeShopName,
            telephone: changeShopNumber,
            address: changeShopAddress,
            hour: {
                start: changeShopHour[0].toLocaleString('en-US', { hour: 'numeric', hour12: true }),
                end: changeShopHour[1].toLocaleString('en-US', { hour: 'numeric', hour12: true })
            }
        }

        console.log(data);

        const options = {
            method: 'PUT',
            url: 'http://localhost:8000/api/bobashop/',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            data: {
                "shop_name": changeShopName,
                "telephone": changeShopNumber,
                "address": changeShopAddress,
                "hour": {
                    "start": changeShopHour[0].toLocaleString('en-US', { hour: 'numeric', hour12: true }),
                    "end": changeShopHour[1].toLocaleString('en-US', { hour: 'numeric', hour12: true })
                },
                // "images": [...createShopImages]
            }
        };

        axios.request(options)
            .then(res => {
                console.log(res.data);
                return res.data;
            })
            .catch(err => console.log(err))


        formChangeInfo.resetFields();
    }

    const prefixSelector = (
        <Form.Item name="prefix" noStyle>
            <Select style={{ width: 70 }}>
                <Option value="1">+1</Option>
                <Option value="84">+84</Option>
            </Select>
        </Form.Item>
    );

    const handleUploadImage = (e) => {
        e.preventDefault();

        const file = newDrinkImageFile;

        const unique_id = uuid();
        console.log(unique_id);

        if (!file) return;

        // config the storage signify drinks of a shop
        const storageRef = ref(storage, `drinks/${unique_id}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress =
                    Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgresspercent(progress);
            },
            (error) => {
                alert(error);
            },

            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log(downloadURL);
                    // save to state
                    setNewDrinkImageUrl(downloadURL);
                });
            }
        );
    }

    const handleSubmitCreateDrink = () => {
        let data = {
            name: newDrinkName,
            description: newDrinkDescription,
            type: newDrinkType,
            price: newDrinkPrice,
            imageFile: newDrinkImageFile,
            imageUrl: newDrinkImageUrl
        }

        const options = {
            method: 'PUT',
            url: 'http://localhost:8000/api/drinks/',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            data: {
                "name": newDrinkName,
                "description": newDrinkDescription,
                "type": newDrinkType,
                "price": newDrinkPrice,
                "imageUrl": newDrinkImageUrl
            }
        };

        const createDrink = async () => {
            const result = await axios.request(options)
                .then(res => res.data)
                .catch(err => console.log(err));

            console.log("result: ", result);
        }

        // handle submit content if percent = 100% or file not available
        if (!newDrinkImageFile || progresspercent === 100) {
            // submit
            createDrink();
            console.log(data);

            // reset the fields
            formCreateDrink.resetFields();
            setNewDrinkImageFile(null);
            setNewDrinkImageUrl(null);
            setProgresspercent(0);
        }
    }

    const formatPhoneNumber = (phoneNumberString) => {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return null;
    }

    // TODO: implement this
    const handleDeleteShop = () => {

    }

    return (
        <>
            {
                shopData &&
                <div style={{
                    width: '90%',
                    height: '90%',
                    top: '30%',
                    backgroundColor: 'white',
                    color: 'black',
                    padding: 20,
                    margin: 5,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                    <div style={{
                        width: '30%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{
                            width: '80%',
                        }}>
                            <Image height={'100%'} src={shopData.logo_url} />
                        </div>
                        <div
                            style={{
                                // put something here if needed
                            }}
                        >
                            Overall rating: {shopData.rating} <StarOutlined />
                        </div>
                    </div>
                    <div style={{
                        width: '40%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        fontSize: '20px'
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div style={{
                                fontSize: 25,
                                fontWeight: 'bolder'
                            }}>
                                <div
                                    onMouseEnter={handleShopNameMouseEnter}
                                    onMouseLeave={handleShopNameMouseLeave}
                                    style={{
                                        textDecoration: isHoverShopName ? 'underline' : 'none',
                                        color: isHoverShopName ? '#FFB6C1' : 'black',
                                        cursor: 'pointer'
                                    }}
                                    onClick={handleClickOnShopName}
                                >
                                    {shopData.shop_name}
                                </div>
                            </div>
                            <div style={{
                                marginTop: 20
                            }}>
                                <div>
                                    <b>Address: </b>
                                    {shopData.address}
                                </div>
                                <div>
                                    <b>Hours: </b>
                                    {shopData.hours.start} - {shopData.hours.end}
                                </div>
                                <div>
                                    <b>Tel: </b>
                                    {/* (216) 862-7690 */}
                                    {formatPhoneNumber(shopData.tel)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            width: '40%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '15%',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Button
                                size='large'
                                onMouseEnter={handleChangeShopInfoMouseEnter}
                                onMouseLeave={handleChangeShopInfoMouseLeave}
                                style={{
                                    backgroundColor: isHoverChangeShopInfo ? '#FDD0CF' : 'white',
                                    color: isHoverChangeShopInfo ? 'white' : 'black',
                                    borderColor: isHoverChangeShopInfo ? '#FDD0CF' : '#d7d7d7',
                                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                                    marginBottom: '20px'
                                }}
                                onClick={handleShowChangeShopOverlay}
                                block
                            >
                                Change shop's info
                            </Button>

                            {
                                showChangeShopInfoOverlay &&
                                <Form
                                    style={{
                                        marginTop: 10
                                    }}
                                    form={formChangeInfo}
                                >
                                    <Form.Item
                                        label="Shop name"
                                        name="shop name"
                                    >
                                        <Input
                                            value={changeShopName}
                                            onChange={e => setChangeShopName(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Address"
                                        name="address"
                                    >
                                        <Input
                                            value={changeShopAddress}
                                            onChange={e => setChangeShopAddress(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Hours"
                                        name="hours"
                                    >
                                        <TimePicker.RangePicker
                                            value={changeShopHour}
                                            onChange={e => setChangeShopHour([e[0].$d, e[1].$d])}
                                        />
                                    </Form.Item>

                                    {/* allow number only */}
                                    <Form.Item
                                        label="Contact number"
                                        name="telephoneNumber"
                                        rules={[{ message: 'Please input your shop telephone number!' }]}
                                    >
                                        <Input
                                            // addonBefore={prefixSelector}
                                            style={{ width: '100%' }}
                                            type="number"
                                            value={changeShopNumber}
                                            onChange={e => setChangeShopNumber(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Button
                                        onMouseEnter={handleHoverSubmitCreateShopEnter}
                                        onMouseLeave={handleHoverSubmitCreateShopLeave}
                                        style={{
                                            backgroundColor: isHoverSubmitCreateShop ? '#FDD0CF' : 'white',
                                            color: isHoverSubmitCreateShop ? 'white' : 'black',
                                            borderColor: isHoverSubmitCreateShop ? '#FDD0CF' : '#d7d7d7',
                                            marginBottom: '20px'
                                        }}
                                        type="primary"
                                        htmlType="submit"
                                        onClick={handleSubmitChangeShopInfo}
                                    >
                                        Submit
                                    </Button>
                                </Form>
                            }

                            <Button
                                size='large'
                                onMouseEnter={handleCreateDrinkMouseEnter}
                                onMouseLeave={handleCreateDrinkMouseLeave}
                                style={{
                                    backgroundColor: isHoverCreateDrink ? '#FDD0CF' : 'white',
                                    color: isHoverCreateDrink ? 'white' : 'black',
                                    borderColor: isHoverCreateDrink ? '#FDD0CF' : '#d7d7d7',
                                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                                }}
                                onClick={handleShowCreateDrinkOverlay}
                                block
                            >
                                Create a drink
                            </Button>

                            {
                                showCreateDrinkOverlay &&
                                <Form
                                    style={{
                                        marginTop: 10,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    form={formCreateDrink}
                                >
                                    <Form.Item
                                        label="Drink Name"
                                        name="drink name"
                                    >
                                        <Input
                                            value={newDrinkName}
                                            onChange={e => setNewDrinkName(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Description"
                                        name="description"
                                    >
                                        <TextArea
                                            rows={4}
                                            value={newDrinkDescription}
                                            onChange={e => setNewDrinkDescription(e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Drink Type"
                                        name="type"
                                    >
                                        <Input
                                            value={newDrinkType}
                                            onChange={e => setNewDrinkType(e.target.value)}
                                        />
                                    </Form.Item>

                                    {/* allow number only */}
                                    <Form.Item
                                        label="Price (in $)"
                                        name="price"
                                    // rules={[{ message: 'Please input your shop telephone number!' }]}
                                    >
                                        <Input
                                            // addonBefore={prefixSelector}
                                            style={{ width: '100%' }}
                                            type="number"
                                            value={newDrinkPrice}
                                            onChange={e => setNewDrinkPrice(e.target.value)}
                                        />
                                    </Form.Item>

                                    {/* allow upload a single image */}
                                    <Input
                                        type="file"
                                        onChange={(e) => { setNewDrinkImageFile(e.target.files[0]) }}
                                        style={{
                                            marginBottom: 10
                                        }}
                                        accept="image/*"
                                    />

                                    <Button
                                        onClick={handleUploadImage}
                                        style={{
                                            marginBottom: 10
                                        }}
                                    >
                                        Upload to Google Blob
                                    </Button>

                                    {
                                        !newDrinkImageUrl &&
                                        <div>
                                            <div style={{ width: `${progresspercent}%` }}>{progresspercent}%</div>
                                        </div>
                                    }

                                    <Button
                                        onMouseEnter={handleHoverSubmitCreateShopEnter}
                                        onMouseLeave={handleHoverSubmitCreateShopLeave}
                                        style={{
                                            backgroundColor: isHoverSubmitCreateShop ? '#FDD0CF' : 'white',
                                            color: isHoverSubmitCreateShop ? 'white' : 'black',
                                            borderColor: isHoverSubmitCreateShop ? '#FDD0CF' : '#d7d7d7',
                                            marginBottom: '20px'
                                        }}
                                        type="primary"
                                        htmlType="submit"
                                        onClick={handleSubmitCreateDrink}
                                    >
                                        Submit
                                    </Button>
                                </Form>
                            }
                        </div>

                        <Button
                            onMouseEnter={handleDeleteShopMouseEnter}
                            onMouseLeave={handleDeleteShopMouseLeave}
                            size='large'
                            style={{
                                backgroundColor: isHoverDeleteShop ? '#ff0e0e' : 'white',
                                color: isHoverDeleteShop ? 'white' : '#ff0e0e',
                                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                            }}
                            onClick={handleDeleteShop}
                            danger
                            block
                        >
                            Delete shop
                        </Button>
                    </div>
                </div>
            }
        </>
    )
}

export default ShopPreviewCard;
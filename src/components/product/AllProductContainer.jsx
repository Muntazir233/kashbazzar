import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as newApi from "../../api/apiCollection"
import ProductCard from './ProductCard';
import "./allproductcontainer.css"
import Skeleton from 'react-loading-skeleton';


const AllProductContainer = () => {
    const total_products_per_page = 12;
    const { t } = useTranslation()
    const city = useSelector(state => state.city);
    const [homepageProducts, setHomepageProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalProducts, settotalProducts] = useState(0);
    const [offset, setoffset] = useState(0);


    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setIsLoading(true)
                const result = await newApi.productByFilter({ latitude: city?.city?.latitude, longitude: city?.city?.longitude, filters: { limit: total_products_per_page, offset: offset } });
                if (result.status === 1) {
                    if (offset === 0) {
                        setHomepageProducts(result.data);
                    } else {
                        setHomepageProducts((prevProduct) => [...prevProduct, ...result.data]);
                    }
                    settotalProducts(result.total);
                    setIsLoading(false)
                } else {
                    setHomepageProducts([])
                    setIsLoading(false);
                    settotalProducts(0);
                }
            } catch (error) {
                setIsLoading(false)
                console.log(error)
            }
        }
        fetchAllProducts();
    }, [offset, city])



    useEffect(() => {
        setoffset(0);
    }, [city]);

    const handleFetchMore = async () => {
        setoffset(offSet => offSet + total_products_per_page)
    }

    const placeholderItems = Array.from({ length: 4 }).map((_, index) => index);

    return (
        isLoading == true ? (
            <div className='h-100 all-product-container container'>
                <div className='row flex-wrap'>
                    {placeholderItems.map((index) => (
                        <div key={index} className={'col-md-6 col-sm-6 col-lg-4 col-12 flex-column mt-3 col-xl-3'}>
                            <Skeleton height={230} className='mt-3' borderRadius={8} />
                        </div>
                    ))}
                </div>
            </div>
        ) :
            homepageProducts.length > 0 &&
            <section>
                <div className='container '>
                    <div className='all-product-container'>
                        <div className='all-product-heading'>
                            {t("allProducts")}

                        </div>
                        <div className='all-products-body d-flex row  flex-wrap'>
                            {homepageProducts && homepageProducts.map((product, index) => {
                                return (
                                    <div key={index} className='col-md-4 col-sm-6 col-lg-3 col-12 product-list-grid col-xl-2  my-2'>
                                        <ProductCard product={product} />
                                    </div>
                                )
                            })}
                            <div className='pagination'>
                                {(totalProducts > homepageProducts?.length) ?
                                    <button className='load-mote-btn' onClick={handleFetchMore}>{t("load_more")}</button>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>


            </section>
    )
}

export default AllProductContainer
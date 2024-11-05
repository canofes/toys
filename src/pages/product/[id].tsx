import { GetStaticPaths, GetStaticProps } from 'next'
import Stripe from 'stripe'
import { stripe } from '../../lib/stripe'
import { ImageContaider, ProductContaider, ProductDetails } from '../../styles/pages/product'
import Image from "next/image";
import axios from 'axios';
import { useState } from 'react';
import Head from 'next/head';

interface ProductProps {
    product: {
        id: string;
        name: string;
        imageUrl: string;
        price: string;
        description: string;
        defaultPriceId: string;
    }
}

export default function Product({ product }: ProductProps) {
   const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false) 

    async function handleBuyProduct() {
        try {
            setIsCreatingCheckoutSession(true)
            const response = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId,
            })

            const { checkoutUrl } = response.data;
            
            window.location.href = checkoutUrl

        } catch (err) {
            // Conectar com uma ferramenta de observabilidade (Datadog / Sentry)
            setIsCreatingCheckoutSession(false)

            alert('Falha ao redirecionar ao checkout!')
        }
    }
    return (

        <>
            <Head>
                <title>{product.name}</title>
            </Head>
            <ProductContaider>
                <ImageContaider>
                    <Image src={product.imageUrl} alt='' width={520} height={480} />
                </ImageContaider>

                <ProductDetails>
                    <h1>{product.name}</h1>
                    <span>{product.price}</span>
                    <p>{product.description}</p>
                
                    <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>
                        Comprar agora.
                    </button>
                </ProductDetails>
            </ProductContaider>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            {params: {id: 'prod_R7gZ8ZMKltmEQe'} }
        ],
        fallback: 'blocking',
    }
} 

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
    const productId = params?.id;

    try {
        const product = await stripe.products.retrieve(productId as string, {
            expand: ['default_price'],
        });

        const price = product.default_price as Stripe.Price;

        return {
            props: {
                product: {
                    id: product.id,
                    name: product.name,
                    imageUrl: (product.images && product.images.length > 0) ? product.images[0] : null, // Verifica se há uma imagem
                    price: new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(price.unit_amount / 100),
                    description: product.description || null,
                    defaultPriceId: price.id,
                },
            },
            revalidate: 60 * 60, // 1 hora
        };
    } catch (error) {
        console.error('Error retrieving product:', error);
        return {
            notFound: true, // Retorna uma página 404 se não encontrar o produto
        };
    }
};

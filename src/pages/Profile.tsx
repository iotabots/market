import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useWeb3React } from "@web3-react/core"

import { ethers } from "ethers";

import IOTABOTS_ABI from "../contracts/iotabots_abi.json";

import { injected } from "../components/wallet/connectors"
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import axios from 'axios'

import { useState, useEffect } from 'react';

// const iotabotsContractAddress = "0x6c2D60145cDD0396bd03298693495bf98fcdD93E"; // LIVE
const iotabotsContractAddress = "0x4da36b053023D470F13753C8cF1dF61b44f2EFEE"; // Test

export default function Profile() {

    const { active, account, library, connector, activate, deactivate } = useWeb3React()

    useEffect(() => {
        if (active) {
            loadBots()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active])

    interface Bot {
        attributes: Array<object>;
        date: number;
        description: string;
        dna: string;
        edition: number;
        image: string;
        name: string;
    }


    const [bots, setBots] = useState<Array<any>>([]);

    const callback = function (err: any) {
        console.log("callback1", err)
    }

    async function connect() {
        try {
            let x = await activate(injected, callback)
            console.log("activated", x)
            console.log("activated", active)
            console.log("activated", account)
            // useEffect(() => {
            //     loadBots()
            // }, [])
        } catch (ex) {
            console.log(ex)
        }
    }

    async function loadBots() {
        // await connect();
        console.log("library", library)
        console.log("connector", connector)
        const provider = new ethers.providers.Web3Provider(library.currentProvider)
        console.log("provider", provider)
        let contract = new ethers.Contract(
            iotabotsContractAddress,
            IOTABOTS_ABI,
            provider
        )
        console.log("contract", contract)
        console.log("account", account)


        const data = await contract.walletOfOwner(account)
        console.log("data:", data)
        const items: Array<Bot> = await Promise.all(data.map(async (i: any) => {
            let token_index = i.toNumber()
            console.log("token_index:", token_index)

            const metadata_url = await contract.tokenURI(token_index)
            console.log("metadata_url:", metadata_url)

            const metadata = await axios.get(metadata_url)

            console.log("metadata:", metadata)
            console.log("metadata:", metadata.data)
            return metadata.data
        }))

        console.log("items:", items)
        setBots(items)
        console.log("bots:", bots)
        // const tokenContract = new ethers.Contract(iotabotsContractAddress, IOTABOTS_ABI, provider)
        // console.log("tokenContract:", tokenContract)
    }

    async function disconnect() {
        try {
            deactivate()
            console.log("deactivated")
        } catch (ex) {
            console.log(ex)
        }
    }


    var content;
    if (active) {
        content = <>
            <br />
            <Container maxWidth="sm">
                <Box sx={{ bgcolor: '#cfe8fc', padding: "10px", textAlign: "center" }} >

                    {active ? <span>Connected with <b>{`${account!.substring(0, 6)}...${account!.substring(account!.length - 4)}`}</b></span> : <span>Not connected</span>}
                    <Button variant="outlined" onClick={disconnect} >Disconnect</Button>
                </Box>
            </Container>
            <hr />
            <br />

            <Typography
                component="h3"
                variant="h3"
                align="center"
                color="#fff"
                gutterBottom
            >
                Your IOTABOTS:</Typography>
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center'}} >

                    {bots.map((bot, index) => (
                        <Grid item key={index} xs={12} sm={12} md={12}>
                            <Card
                            // sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                <CardMedia
                                    height="100%"
                                    component="img"
                                    image={bot.image}
                                    alt="IOTABOT"
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h6">
                                        {`IOTABOT ${bot.name}`}
                                    </Typography>
                                    <Typography gutterBottom variant="body1" component="p">
                                        {`DNA ${bot.dna}`}
                                    </Typography>
                                    <Typography gutterBottom variant="body1" component="p">
                                        {`Edition ${bot.edition}`}
                                    </Typography>
                                    <Typography gutterBottom variant="body1" component="p">
                                        {`Created on ${new Date(bot.date).toLocaleDateString()}`}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Box>
            </Container>
        </>;
    } else {
        content =
            <Container maxWidth="sm">
                <Box sx={{ bgcolor: '#cfe8fc', padding: "10px", textAlign: "center" }} >

                    <Button variant="outlined" onClick={connect} >Connect to MetaMask</Button></Box>
            </Container>;
    }

    return (
        <>
            <CssBaseline />
            <main>
                {/* Hero unit */}
                <Container sx={{ py: 8 }} maxWidth="md">
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="#fff"
                        gutterBottom
                    >
                        Your Profile
                    </Typography>
                    {/* End hero unit */}
                    {content}
                </Container>
            </main>
        </>
    );
}
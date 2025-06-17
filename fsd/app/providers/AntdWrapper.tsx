"use client"
import {ConfigProvider, App } from "antd";
import locale from 'antd/locale/ru_RU';
import NextTopLoader from "nextjs-toploader";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export default function AntdWrapper({children}: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider
                locale={locale}
                theme={{
                    token: {
                        // colorSplit: '#D1F0D1',
                        colorPrimary: '#8e44ad',
                        // colorLink: '#0A5900',
                        //borderRadius: 4,
                        fontFamily: `inherit`,
                        controlHeight: 42,
                        colorTextPlaceholder: '#515151',
                        // colorError: '#FF6463',
                        // controlHeightXS: 24,
                        // controlHeightSM: 30,
                        // controlHeight: 42,
                        // colorBgSpotlight: '#17A700',
                        // colorInfo: '#17A700',
                        // colorInfoBg: '#D1F0D1'
                        colorBgElevated: "#111",
                        colorTextDescription: "#fff"
                    },
                    components: {
                        Message: {
                            colorText: "#fff",
                        },
                        Popconfirm: {
                            colorText: "#fff",
                            colorTextHeading: "#fff",
                        },
                        Button: {
                            paddingContentVertical: 8,
                            paddingContentHorizontal: 24,
                            fontWeight: 600,
                            defaultBg: "#1a1a1a",
                            defaultColor: "#fff",
                            defaultBorderColor: "#2a2a2a",
                            defaultHoverBg: "transparent",
                            defaultActiveBg: "#2a2a2a",
                            //colorTextPlaceholder: '#999999',
                            //colorText: '#0A5900'
                            /*
                            textHoverBg: '#1b1b1b',
                            contentFontSize: 16,
                            defaultBg: 'transparent',
                            defaultBorderColor: '#fff',
                            defaultColor: '#fff',
                            defaultHoverBg: 'transparent',
                            defaultActiveBg: 'transparent',
                            colorPrimaryTextHover: '#1b1b1b',
                            colorTextDisabled: '#848484',
                            borderColorDisabled: '#848484'*/
                        },
                        Upload: {
                            colorText: "#a5a5a5",
                            colorIcon: "#a5a5a5",
                            colorTextDescription: "#a5a5a5"
                        },
                        Tabs: {
                            colorBorderSecondary: "#2a2a2a",
                            itemColor: "#fff",
                        },
                        Progress: {
                            defaultColor: "#8e44ad",
                            remainingColor: "#2a2a2a",
                        },
                        Select: {
                            colorText: "#fff",
                            selectorBg: "#1a1a1a",
                            colorBorder: "#2a2a2a",
                            multipleItemBg: "#2a2a2a",
                            colorIcon: "#fff",
                            colorIconHover: "#eee",
                            colorBgContainer: "#1a1a1a",
                            optionSelectedBg: "#2a2a2a",



                        },
                        // Collapse: {
                        //     contentPadding: "16px",
                        //     headerPadding: "6px",
                        //     paddingSM: 4
                        // },
                        // Select: {
                        //     optionSelectedBg: "#D1F0D1",
                        //     optionSelectedColor: "#0A5900"
                        // },
                        // Table: {
                        //     headerColor: "#0A5900",
                        //     rowHoverBg: "#ebf3eb"
                        // },
                        // Modal: {
                        //     titleColor: "#0A5900",
                        //     titleFontSize: 20
                        // }
                        // Radio:{
                        //     colorBgContainer: '#353535',
                        //     colorBorder: '#686868',
                        //     radioSize: 20,
                        //     buttonPaddingInline: 12,
                        //     dotSize: 10
                        // },
                        // Checkbox: {
                        //     colorBgContainer: '#353535',
                        //     colorBorder: '#686868',
                        // }
                        Modal: {
                            contentBg: '#111111',
                            headerBg: '#111111',
                            titleColor: "#fff",
                            colorIcon: "#fff",
                            colorIconHover: "#515151"
                        },
                        Form: {
                            labelColor: "#fff"
                        },
                        Input: {
                            colorText: "#fff",
                            colorBgContainer: "#1a1a1a",
                            colorBorder: "#2a2a2a"
                        }
                    },

                }}
            >
                <NextTopLoader color={'#8e44ad'}/>
                <App>
                    {children}
                </App>
            </ConfigProvider>
        </AntdRegistry>
    )
}

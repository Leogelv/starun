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
                        colorPrimary: '#9333ea',
                        colorLink: '#a855f7',
                        colorLinkHover: '#c084fc',
                        colorLinkActive: '#7c2d8a',
                        fontFamily: `inherit`,
                        controlHeight: 42,
                        colorTextPlaceholder: 'rgba(233, 213, 255, 0.5)',
                        colorBgElevated: "#110e1f",
                        colorTextDescription: "#e9d5ff",
                        colorText: "#ffffff",
                        colorTextSecondary: "#e9d5ff",
                        colorTextTertiary: "#d8b4fe",
                        colorTextQuaternary: "#c084fc",
                        colorBorder: "rgba(139, 92, 246, 0.2)",
                        colorBorderSecondary: "rgba(139, 92, 246, 0.1)",
                        colorFill: "rgba(139, 92, 246, 0.1)",
                        colorFillSecondary: "rgba(139, 92, 246, 0.08)",
                        colorFillTertiary: "rgba(139, 92, 246, 0.05)",
                        colorFillQuaternary: "rgba(139, 92, 246, 0.02)",
                        colorBgContainer: "#1a1630",
                        colorBgLayout: "#0A0818",
                        colorBgMask: "rgba(10, 8, 24, 0.8)",
                        colorSuccess: "#52c41a",
                        colorWarning: "#faad14",
                        colorError: "#ff4d4f",
                        colorInfo: "#9333ea",
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(147, 51, 234, 0.15)",
                        boxShadowSecondary: "0 4px 16px rgba(147, 51, 234, 0.1)"
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
                            defaultBg: "rgba(139, 92, 246, 0.1)",
                            defaultColor: "#fff",
                            defaultBorderColor: "rgba(139, 92, 246, 0.3)",
                            defaultHoverBg: "rgba(139, 92, 246, 0.2)",
                            defaultActiveBg: "rgba(139, 92, 246, 0.3)",
                            primaryColor: "#fff",
                            primaryShadow: "0 0 20px rgba(147, 51, 234, 0.4)",
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
                            colorBorderSecondary: "rgba(139, 92, 246, 0.2)",
                            itemColor: "#e9d5ff",
                            itemSelectedColor: "#fff",
                            itemHoverColor: "#fff",
                            inkBarColor: "#9333ea",
                        },
                        Progress: {
                            defaultColor: "#9333ea",
                            remainingColor: "rgba(139, 92, 246, 0.1)",
                        },
                        Select: {
                            colorText: "#fff",
                            selectorBg: "rgba(139, 92, 246, 0.1)",
                            colorBorder: "rgba(139, 92, 246, 0.3)",
                            multipleItemBg: "rgba(139, 92, 246, 0.2)",
                            colorIcon: "#e9d5ff",
                            colorIconHover: "#fff",
                            colorBgContainer: "#1a1630",
                            optionSelectedBg: "rgba(139, 92, 246, 0.3)",



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
                            contentBg: '#110e1f',
                            headerBg: '#110e1f',
                            titleColor: "#fff",
                            colorIcon: "#e9d5ff",
                            colorIconHover: "#fff",
                            footerBg: 'transparent',
                            colorSplit: 'rgba(139, 92, 246, 0.2)'
                        },
                        Form: {
                            labelColor: "#e9d5ff",
                            labelFontSize: 14,
                            labelHeight: 28,
                            itemMarginBottom: 24
                        },
                        Input: {
                            colorText: "#fff",
                            colorBgContainer: "rgba(139, 92, 246, 0.1)",
                            colorBorder: "rgba(139, 92, 246, 0.3)",
                            activeBorderColor: "#9333ea",
                            hoverBorderColor: "#a855f7",
                            activeShadow: "0 0 0 2px rgba(147, 51, 234, 0.2)"
                        }
                    },

                }}
            >
                <NextTopLoader color={'#9333ea'}/>
                <App>
                    {children}
                </App>
            </ConfigProvider>
        </AntdRegistry>
    )
}

import Image from "next/image";

export function ClientUnsupported() {
    return (
        <div className={'flex py-10 px-3 flex-col gap-4 items-center justify-center'}>
            <Image src={'https://xelene.me/telegram.gif'} alt={''} width={180} height={180}/>
            <div className={'flex flex-col gap-2 items-center'}>
                <h2 className={'font-bold text-2xl'}>⚠️ Приложение недоступно</h2>
                <p className={'text-center max-w-[600px]'}>Это мини-приложение может быть открыто только внутри Telegram-клиента.<br />
                    Пожалуйста, откройте его через Telegram, используя соответствующую кнопку или ссылку.</p>
            </div>
        </div>
    );
}
export function openWhatsApp(phone: string | null, clientName: string, userName: string) {
    console.log('Botão WhatsApp clicado:', { phone, clientName, userName });

    if (!phone) {
        console.warn('Telefone não fornecido');
        return;
    }

    // Remove tudo que não é número
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 8) {
        console.warn('Número muito curto:', cleanPhone);
        return;
    }

    let finalPhone = cleanPhone;

    // Se o número não começar com 55 e tiver 10 ou 11 dígitos, adiciona o código do Brasil
    if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
        finalPhone = '55' + cleanPhone;
    }

    const txt = encodeURIComponent(`Olá ${clientName}, me chamo ${userName}. Vi que você se interessou pelos nossos serviços, podemos conversar sobre?`);
    const waUrl = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${txt}`;

    console.log('Abrindo URL:', waUrl);

    // Tenta abrir em nova aba
    const win = window.open(waUrl, '_blank');
    if (win) {
        win.focus();
    } else {
        // Fallback caso o browser bloqueie o popup
        window.location.href = waUrl;
    }
}

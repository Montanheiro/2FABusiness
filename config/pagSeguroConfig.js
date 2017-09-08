module.exports = function(status){
    if(status === "producao"){
        return {
            email: 'laynerclever@gmail.com',
            token: '8563C820FE2848D48057ED0F54DA1AFB',
            urlPreApprovalsEmail: 'https://ws.pagseguro.uol.com.br/v2/pre-approvals/request?email=',
            urlPreApprovalsCode: 'https://pagseguro.uol.com.br/v2/pre-approvals/request.html?code=',
            urlTransactionsNotifications: 'https://ws.pagseguro.uol.com.br/v3/transactions/notifications/',
            urlPreApprovalsNotifications: 'https://ws.pagseguro.uol.com.br/v2/pre-approvals/notifications/',
            urlPreApprovalsCancel: 'https://ws.pagseguro.uol.com.br/v2/pre-approvals/cancel/'
        }
    }

    return {
            email: 'laynerclever@gmail.com',
            token: '0B148DD2F9834DD893C8F904A8C81108',
            urlPreApprovalsEmail: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/request?email=',
            urlPreApprovalsCode: 'https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=',
            urlTransactionsNotifications: 'https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/',
            urlPreApprovalsNotifications: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/notifications/',
            urlPreApprovalsCancel: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/cancel/'
    }
}
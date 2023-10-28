import * as Utilities from "../Class/Utilities";

describe('KeyFactory Class', () => {

    test('Get Host', () => {
        let request = "GET /hello.htm HTTP/1.1\r\n" +
            "User-Agent: Mozilla/4.0 (compatible; MSIE5.01; Windows NT)\r\n" +
            "Host: www.tutorialspoint.com:80\r\n" +
            "Accept-Language: en-us\r\n" +
            "Accept-Encoding: gzip, deflate\r\n" +
            "Connection: Keep-Alive\r\n";

        let header = Utilities.getHost(request)?.header
        let host = Utilities.getHost(request)?.host
        let port = Utilities.getHost(request)?.port
        expect(header).toEqual("Host: www.tutorialspoint.com:80");
        expect(host).toEqual("www.tutorialspoint.com");
        expect(port).toEqual(80);
    });

});
package de.homuth.games.server.filter;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author jhomuth
 */
public class RestServiceFilter implements Filter {

    /**
     * @see javax.servlet.Filter#destroy()
     */
    @Override
    public void destroy() {
    }

    /**
     * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
     * javax.servlet.ServletResponse, javax.servlet.FilterChain)
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;

        // Add CORS header
        String clientOrigin = httpServletRequest.getHeader("origin");
        httpServletResponse.setHeader("Access-Control-Allow-Origin", (clientOrigin != null) ? clientOrigin : "*");
        httpServletResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpServletResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        httpServletResponse.setHeader("Access-Control-Allow-Headers", "Content-Type");
        httpServletResponse.setHeader("Access-Control-Max-Age", "86400");

        // This will prevent 304s in IE for ajax GET requests
        httpServletResponse.setHeader("Expires", "-1");

        chain.doFilter(request, response);
    }

    /**
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    @Override
    public void init(FilterConfig config) throws ServletException {
    }

}

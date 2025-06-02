package main

import (
    "bytes"
    "encoding/base64"
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
    "strings"
    "sync"
    "time"
)

const (
    workers = 60               // número de goroutines concorrentes
    timeout = 30 * time.Second // timeout do client
)

func makeRequest(wg *sync.WaitGroup, reqChan chan int, method, host, path string, headers http.Header, body []byte, client *http.Client) {
    defer wg.Done()
    for idx := range reqChan {
        // monta nova req para cada id
        url := "https://" + host + path
        req, err := http.NewRequest(method, url, bytes.NewReader(body))
        if err != nil {
            fmt.Printf("[#%d] NewRequest error: %v\n", idx, err)
            continue
        }
        // aplica headers
        for k, vals := range headers {
            for _, v := range vals {
                req.Header.Add(k, v)
            }
        }
        // dispara
        resp, err := client.Do(req)
        if err != nil {
            fmt.Printf("[#%d] Error: %v\n", idx, err)
            continue
        }
        ioutil.ReadAll(resp.Body)
        resp.Body.Close()
        fmt.Printf("[#%d] Status: %d %s\n", idx, resp.StatusCode)
    }
}

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: go run race.go <base64-raw-request>")
        os.Exit(1)
    }

    // 1) decodifica base64
    raw, err := base64.StdEncoding.DecodeString(os.Args[1])
    if err != nil {
        fmt.Printf("base64 decode error: %v\n", err)
        os.Exit(1)
    }
    txt := string(raw)

    // 2) separa cabeçalhos / body
    parts := strings.SplitN(txt, "\r\n\r\n", 2)
    headLines := strings.Split(parts[0], "\r\n")
    body := []byte("")
    if len(parts) > 1 {
        body = []byte(parts[1])
    }

    // 3) extrai método e caminho
    cols := strings.Fields(headLines[0])
    if len(cols) < 3 {
        fmt.Println("Invalid request line:", headLines[0])
        os.Exit(1)
    }
    method, path := cols[0], cols[1]

    // 4) extrai host e demais headers
    headers := make(http.Header)
    var host string
    for _, line := range headLines[1:] {
        if line == "" {
            continue
        }
        kv := strings.SplitN(line, ": ", 2)
        if len(kv) != 2 {
            continue
        }
        k, v := kv[0], kv[1]
        if strings.ToLower(k) == "host" {
            host = v
        }
        headers.Add(k, v)
    }
    if host == "" {
        fmt.Println("Host header missing")
        os.Exit(1)
    }

    // 5) configura HTTP client com keep-alive
    client := &http.Client{
        Transport: &http.Transport{
            MaxIdleConnsPerHost: workers,
            IdleConnTimeout:     90 * time.Second,
        },
        Timeout: timeout,
    }

    // 6) dispara workers
    reqChan := make(chan int, workers)
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go makeRequest(&wg, reqChan, method, host, path, headers, body, client)
    }

    // enfileira índices
    for i := 0; i < workers; i++ {
        reqChan <- i + 1
    }
    close(reqChan)
    wg.Wait()

    fmt.Println("Completed")
}
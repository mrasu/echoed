// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
using System;
using System.Threading.Tasks;
using Grpc.Net.Client;
using Oteldemo;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using Xunit;
using static Oteldemo.CartService;

namespace cartservice.tests;

public class CartServiceTests
{
    private readonly IHostBuilder _host;

    public CartServiceTests()
    {
        _host = new HostBuilder().ConfigureWebHost(webBuilder =>
        {
            webBuilder
                //  .UseStartup<Startup>()
                .UseTestServer();
        });
    }

    [Fact(Skip = "See https://github.com/open-telemetry/opentelemetry-demo/pull/746#discussion_r1107931240")]
    public async Task GetItem_NoAddItemBefore_EmptyCartReturned()
    {
        // Setup test server and client
        using var server = await _host.StartAsync();
        var httpClient = server.GetTestClient();

        string userId = Guid.NewGuid().ToString();

        // Create a GRPC communication channel between the client and the server
        var channel = GrpcChannel.ForAddress(httpClient.BaseAddress, new GrpcChannelOptions
        {
            HttpClient = httpClient
        });

        var cartClient = new CartServiceClient(channel);

        var request = new GetCartRequest
        {
            UserId = userId,
        };

        var cart = await cartClient.GetCartAsync(request);
        Assert.NotNull(cart);

        // All grpc objects implement IEquitable, so we can compare equality with by-value semantics
        Assert.Equal(new Cart(), cart);
    }

    [Fact(Skip = "See https://github.com/open-telemetry/opentelemetry-demo/pull/746#discussion_r1107931240")]
    public async Task AddItem_ItemExists_Updated()
    {
        // Setup test server and client
        using var server = await _host.StartAsync();
        var httpClient = server.GetTestClient();

        string userId = Guid.NewGuid().ToString();

        // Create a GRPC communication channel between the client and the server
        var channel = GrpcChannel.ForAddress(httpClient.BaseAddress, new GrpcChannelOptions
        {
            HttpClient = httpClient
        });

        var client = new CartServiceClient(channel);
        var request = new AddItemRequest
        {
            UserId = userId,
            Item = new CartItem
            {
                ProductId = "1",
                Quantity = 1
            }
        };

        // First add - nothing should fail
        await client.AddItemAsync(request);

        // Second add of existing product - quantity should be updated
        await client.AddItemAsync(request);

        var getCartRequest = new GetCartRequest
        {
            UserId = userId
        };
        var cart = await client.GetCartAsync(getCartRequest);
        Assert.NotNull(cart);
        Assert.Equal(userId, cart.UserId);
        Assert.Single(cart.Items);
        Assert.Equal(2, cart.Items[0].Quantity);

        // Cleanup
        await client.EmptyCartAsync(new EmptyCartRequest { UserId = userId });
    }

    [Fact(Skip = "See https://github.com/open-telemetry/opentelemetry-demo/pull/746#discussion_r1107931240")]
    public async Task AddItem_New_Inserted()
    {
        // Setup test server and client
        using var server = await _host.StartAsync();
        var httpClient = server.GetTestClient();

        string userId = Guid.NewGuid().ToString();

        // Create a GRPC communication channel between the client and the server
        var channel = GrpcChannel.ForAddress(httpClient.BaseAddress, new GrpcChannelOptions
        {
            HttpClient = httpClient
        });

        // Create a proxy object to work with the server
        var client = new CartServiceClient(channel);

        var request = new AddItemRequest
        {
            UserId = userId,
            Item = new CartItem
            {
                ProductId = "1",
                Quantity = 1
            }
        };

        await client.AddItemAsync(request);

        var getCartRequest = new GetCartRequest
        {
            UserId = userId
        };
        var cart = await client.GetCartAsync(getCartRequest);
        Assert.NotNull(cart);
        Assert.Equal(userId, cart.UserId);
        Assert.Single(cart.Items);

        await client.EmptyCartAsync(new EmptyCartRequest { UserId = userId });
        cart = await client.GetCartAsync(getCartRequest);
        Assert.Empty(cart.Items);
    }
}

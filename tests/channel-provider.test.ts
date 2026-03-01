import { beforeEach, describe, expect, it, vi } from "vitest";
import { setTwitterProviderClient, twitterChannelProvider } from "../src/channel-provider.js";

describe("twitterChannelProvider", () => {
  beforeEach(() => {
    // Clean up state between tests
    twitterChannelProvider.getCommands().forEach((cmd) => twitterChannelProvider.unregisterCommand(cmd.name));
    twitterChannelProvider.getMessageParsers().forEach((p) => twitterChannelProvider.removeMessageParser(p.id));
    setTwitterProviderClient(null);
  });

  it("has id 'twitter'", () => {
    expect(twitterChannelProvider.id).toBe("twitter");
  });

  it("registers and retrieves commands", () => {
    const cmd = { name: "test", description: "test cmd", handler: vi.fn() };
    twitterChannelProvider.registerCommand(cmd);
    expect(twitterChannelProvider.getCommands()).toContainEqual(cmd);
    twitterChannelProvider.unregisterCommand("test");
    expect(twitterChannelProvider.getCommands()).toHaveLength(0);
  });

  it("registers and retrieves message parsers", () => {
    const parser = { id: "p1", pattern: /test/, handler: vi.fn() };
    twitterChannelProvider.addMessageParser(parser);
    expect(twitterChannelProvider.getMessageParsers()).toContainEqual(parser);
    twitterChannelProvider.removeMessageParser("p1");
    expect(twitterChannelProvider.getMessageParsers()).toHaveLength(0);
  });

  it("returns bot username", () => {
    setTwitterProviderClient(null, "testbot");
    expect(twitterChannelProvider.getBotUsername()).toBe("testbot");
  });

  it("throws when sending without client", async () => {
    setTwitterProviderClient(null);
    await expect(twitterChannelProvider.send("tweet:123", "hello")).rejects.toThrow("Twitter client not initialized");
  });

  it("sends a tweet reply when channelId starts with tweet:", async () => {
    const mockTweet = vi.fn().mockResolvedValue("new-tweet-id");
    const mockClient = { tweet: mockTweet, sendDM: vi.fn() } as any;
    setTwitterProviderClient(mockClient);
    await twitterChannelProvider.send("tweet:original-id", "Reply text");
    expect(mockTweet).toHaveBeenCalledWith("Reply text", { replyToId: "original-id" });
  });

  it("sends a DM when channelId starts with dm:", async () => {
    const mockSendDM = vi.fn().mockResolvedValue(undefined);
    const mockClient = { tweet: vi.fn(), sendDM: mockSendDM } as any;
    setTwitterProviderClient(mockClient);
    await twitterChannelProvider.send("dm:user123", "DM text");
    expect(mockSendDM).toHaveBeenCalledWith("user123", "DM text");
  });

  it("posts new tweet for unrecognized channelId", async () => {
    const mockTweet = vi.fn().mockResolvedValue("new-tweet-id");
    const mockClient = { tweet: mockTweet, sendDM: vi.fn() } as any;
    setTwitterProviderClient(mockClient);
    await twitterChannelProvider.send("some-channel", "New tweet text");
    expect(mockTweet).toHaveBeenCalledWith("New tweet text");
  });

  it("truncates content over 280 chars", async () => {
    const mockTweet = vi.fn().mockResolvedValue("tweet-id");
    const mockClient = { tweet: mockTweet, sendDM: vi.fn() } as any;
    setTwitterProviderClient(mockClient);
    const longText = "a".repeat(300);
    await twitterChannelProvider.send("tweet:123", longText);
    const calledWith = mockTweet.mock.calls[0][0] as string;
    expect(calledWith.length).toBeLessThanOrEqual(280);
    expect(calledWith.endsWith("...")).toBe(true);
  });
});

import asyncio
from langchain_core.tools import StructuredTool
from langchain_ollama import ChatOllama
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic import create_model


def mcp_to_langchain_tool(session: ClientSession, mcp_tool):
    """Dynamically converts an MCP tool into a LangChain StructuredTool."""
    fields = {}
    for name, prop in mcp_tool.input_schema.get("properties", {}).items():
        py_type = str if prop.get("type") == "string" else object
        default = ... if name in mcp_tool.input_schema.get("required", []) else None
        fields[name] = (py_type, default)

    args_model = create_model(f"{mcp_tool.name}_args", **fields)

    async def run_tool(**kwargs):
        result = await session.call_tool(mcp_tool.name, arguments=kwargs)
        return result.content[0].text

    return StructuredTool.from_function(
        coroutine=run_tool,
        name=mcp_tool.name,
        description=mcp_tool.description or "",
        args_schema=args_model,
    )


async def main():
    llm = ChatOllama(model="qwen3:4b-instruct", temperature=0)

    server_params = StdioServerParameters(
        command="python",
        args=["server.py"],
    )

    print("Connecting to MCP Server...")

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools_response = await session.list_tools()

            # Load tools (excluding ask_knowledge_base so the Agent itself does the reasoning)
            tools = [
                mcp_to_langchain_tool(session, t)
                for t in tools_response.tools
                if t.name != "ask_knowledge_base"
            ]

            system_prompt = (
                "You are an intelligent assistant with access to the company's private knowledge base. "
                "1. When the user asks you to index or add a new document, use the index_document tool with the file path. "
                "2. When asked about company projects, policies, products, or pricing, NEVER ask for permission to search — ALWAYS call the search_knowledge_base tool immediately. "
                "3. Use the retrieved context to answer the question directly."
            )

            memory = MemorySaver()
            agent = create_react_agent(
                llm, tools, prompt=system_prompt, checkpointer=memory
            )

            print("\n🤖 Agent is ready! Ask me anything (or type 'exit' to quit):\n")

            config = {"configurable": {"thread_id": "session-1"}}
            while True:
                user_input = input("You: ")
                if user_input.strip().lower() in ["exit", "quit"]:
                    print("Goodbye!")
                    break
                if not user_input.strip():
                    continue

                result = await agent.ainvoke(
                    {"messages": [("user", user_input)]}, config=config
                )
                print(f"\nAgent: {result['messages'][-1].content}\n")


if __name__ == "__main__":
    asyncio.run(main())

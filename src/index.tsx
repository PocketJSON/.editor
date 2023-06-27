import ReactDOM from "react-dom/client";

import persistStore from "redux-persist/es/persistStore";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { setupStore } from "./redux/store";

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { OnlineStatusProvider } from "./hooks/react/useOnlineStatus";

const root = ReactDOM.createRoot(document.getElementById("root")!),
	store = setupStore(),
	persistor = persistStore(store);

root.render(
	<Provider store={store}>
		<PersistGate
			loading={null}
			persistor={persistor}
		>
			<ErrorBoundary>
				<OnlineStatusProvider>
					<App />
				</OnlineStatusProvider>
			</ErrorBoundary>
		</PersistGate>
	</Provider>
);

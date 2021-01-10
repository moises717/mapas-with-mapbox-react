import { useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import { useMapbox } from "../hooks/useMapbox";
const puntoInicial = {
	lng: -86.1047,
	lat: 11.9137,
	zoom: 10.88,
};

export const MapaPage = () => {
	const {
		coords,
		setRef,
		nuevoMarcador$,
		movimientoMarcador$,
		agregarMarcador,
		actualizarPosicion,
	} = useMapbox(puntoInicial);

	const { socket } = useContext(SocketContext);

	// Escuchar los marcadores existentes
	useEffect(() => {
		socket.on("marcadores-activos", (marcadores) => {
			for (const key of Object.keys(marcadores)) {
				agregarMarcador(marcadores[key], key);
			}
		});
	}, [socket, agregarMarcador]);

	//Nuevo marcador

	useEffect(() => {
		nuevoMarcador$.subscribe((marcador) => {
			socket.emit("marcador-nuevo", marcador);
		});
	}, [nuevoMarcador$, socket]);

	useEffect(() => {
		movimientoMarcador$.subscribe((movimiento) => {
			socket.emit("marcador-actualizado", movimiento);
		});
	}, [movimientoMarcador$, socket]);

	// Mover marcador mediente sockets

	useEffect(() => {
		socket.on("marcador-actualizado", (marcador) => {
			actualizarPosicion(marcador);
		});
	}, [socket, actualizarPosicion]);

	// Escuchar nuevos marcdores
	useEffect(() => {
		socket.on("marcador-nuevo", (marcador) => {
			agregarMarcador(marcador, marcador.id);
		});
	}, [socket, agregarMarcador]);

	return (
		<>
			<div className="info">
				Lng: {coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}
			</div>
			<div className="mapContainer" ref={setRef} />
		</>
	);
};
